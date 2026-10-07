import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ======================================================
// PATH SETUP
// ======================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================================================
// CONFIG
// ======================================================

const ROUTES_DIR = path.join(__dirname, "routes");
const VALIDATORS_DIR = path.join(__dirname, "validators");

const OUTPUT_FILE = path.join(
  __dirname,
  "anganwadi-api.postman_collection.json"
);

const BASE_URL = "http://localhost:3000";
const API_PREFIX = "/api";

// ======================================================
// FILE HELPERS
// ======================================================

function readFile(file) {
  return fs.readFileSync(file, "utf8");
}

function exists(file) {
  return fs.existsSync(file);
}

// ======================================================
// GET ALL JS FILES RECURSIVELY
// ======================================================

function getAllJsFiles(dir) {
  const files = [];

  if (!exists(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getAllJsFiles(fullPath));
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".js")
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

// ======================================================
// ESCAPE REGEX
// ======================================================

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ======================================================
// GET ROUTE MOUNTS FROM routes/index.js
//
// Example:
//
// import anganwadiRoutes from "./anganwadi.routes.js";
//
// router.use("/anganwadi", anganwadiRoutes);
//
// ======================================================

function getRouteMounts() {
  const indexFile = path.join(ROUTES_DIR, "index.js");

  if (!exists(indexFile)) {
    throw new Error(
      `routes/index.js not found:\n${indexFile}`
    );
  }

  const code = readFile(indexFile);

  const imports = {};

  // Finds:
  // import anganwadiRoutes from "./anganwadi.routes.js";

  const importRegex =
    /import\s+(\w+)\s+from\s+["'](.+?)["']\s*;?/g;

  let match;

  while ((match = importRegex.exec(code))) {
    imports[match[1]] = match[2];
  }

  const mounts = [];

  // Finds:
  // router.use("/anganwadi", anganwadiRoutes);

  const useRegex =
    /router\.use\s*\(\s*["']([^"']+)["']\s*,\s*(\w+)\s*\)/g;

  while ((match = useRegex.exec(code))) {
    mounts.push({
      prefix: match[1],
      routerName: match[2],
      importPath: imports[match[2]],
    });
  }

  return mounts;
}

// ======================================================
// RESOLVE ROUTE FILE
// ======================================================

function resolveRouteFile(importPath) {
  if (!importPath) {
    return null;
  }

  let cleanPath = importPath;

  if (cleanPath.startsWith("./")) {
    cleanPath = cleanPath.substring(2);
  }

  if (!cleanPath.endsWith(".js")) {
    cleanPath += ".js";
  }

  const filePath = path.join(
    ROUTES_DIR,
    cleanPath
  );

  if (exists(filePath)) {
    return filePath;
  }

  return null;
}

// ======================================================
// EXTRACT ROUTES
//
// Supports:
//
// router.post(
//   "/create",
//   verifyAccessToken,
//   validationMiddleware,
//   controller.create
// );
//
// ======================================================

function extractRoutes(filePath) {
  const code = readFile(filePath);

  const routes = [];

  const regex =
    /router\.(get|post|put|patch|delete|options|head)\s*\(/g;

  let match;

  while ((match = regex.exec(code))) {
    const method = match[1].toUpperCase();

    const openIndex = code.indexOf(
      "(",
      match.index
    );

    if (openIndex === -1) {
      continue;
    }

    let depth = 0;
    let quote = null;
    let closeIndex = -1;

    for (
      let i = openIndex;
      i < code.length;
      i++
    ) {
      const char = code[i];

      // Handle strings
      if (
        (char === '"' ||
          char === "'" ||
          char === "`") &&
        code[i - 1] !== "\\"
      ) {
        if (quote === null) {
          quote = char;
        } else if (quote === char) {
          quote = null;
        }

        continue;
      }

      if (quote !== null) {
        continue;
      }

      if (char === "(") {
        depth++;
      }

      if (char === ")") {
        depth--;

        if (depth === 0) {
          closeIndex = i;
          break;
        }
      }
    }

    if (closeIndex === -1) {
      continue;
    }

    const args = code.substring(
      openIndex + 1,
      closeIndex
    );

    const pathMatch = args.match(
      /^\s*["']([^"']+)["']/
    );

    if (!pathMatch) {
      continue;
    }

    const routePath = pathMatch[1];

    const middleware = args.substring(
      pathMatch[0].length
    );

    routes.push({
      method,
      path: routePath,
      middleware,
    });
  }

  return routes;
}

// ======================================================
// FIND VALIDATION MAPPINGS
//
// Example:
//
// const createValidation =
//    validate(createAnganwadiSchema);
//
// Result:
//
// {
//    createValidation:
//       "createAnganwadiSchema"
// }
//
// ======================================================

function getValidationMappings(routeFile) {
  const code = readFile(routeFile);

  const mappings = {};

  const regex =
    /(?:const|let|var)\s+(\w+)\s*=\s*validate\s*\(\s*(\w+)\s*\)/g;

  let match;

  while ((match = regex.exec(code))) {
    mappings[match[1]] = match[2];
  }

  return mappings;
}

// ======================================================
// FIND SCHEMA USED BY ROUTE
// ======================================================

function findSchemaName(
  routeFile,
  middleware
) {
  const mappings =
    getValidationMappings(routeFile);

  for (
    const [middlewareName, schemaName]
    of Object.entries(mappings)
  ) {
    const regex = new RegExp(
      `\\b${escapeRegex(
        middlewareName
      )}\\b`
    );

    if (regex.test(middleware)) {
      return schemaName;
    }
  }

  return null;
}

// ======================================================
// FIND SCHEMA FILE
//
// Searches all:
//
// validators/*.js
// validators/**/*.js
//
// ======================================================

function findSchemaFile(schemaName) {
  const files =
    getAllJsFiles(VALIDATORS_DIR);

  for (const file of files) {
    const code = readFile(file);

    const regex = new RegExp(
      `(?:export\\s+)?(?:const|let|var)\\s+${escapeRegex(
        schemaName
      )}\\s*=`
    );

    if (regex.test(code)) {
      return file;
    }
  }

  return null;
}

// ======================================================
// EXTRACT Joi.object({ ... })
// ======================================================

function extractJoiObject(
  code,
  schemaName
) {
  const regex = new RegExp(
    `(?:export\\s+)?(?:const|let|var)\\s+${escapeRegex(
      schemaName
    )}\\s*=\\s*Joi\\.object\\s*\\(`
  );

  const match = regex.exec(code);

  if (!match) {
    return null;
  }

  const openParen = code.indexOf(
    "(",
    match.index
  );

  const openBrace = code.indexOf(
    "{",
    openParen
  );

  if (openBrace === -1) {
    return null;
  }

  let depth = 0;
  let quote = null;

  for (
    let i = openBrace;
    i < code.length;
    i++
  ) {
    const char = code[i];

    if (
      (char === '"' ||
        char === "'" ||
        char === "`") &&
      code[i - 1] !== "\\"
    ) {
      if (quote === null) {
        quote = char;
      } else if (quote === char) {
        quote = null;
      }

      continue;
    }

    if (quote !== null) {
      continue;
    }

    if (char === "{") {
      depth++;
    }

    if (char === "}") {
      depth--;

      if (depth === 0) {
        return code.substring(
          openBrace + 1,
          i
        );
      }
    }
  }

  return null;
}

// ======================================================
// EXTRACT JOI FIELDS
// ======================================================

function extractJoiFields(objectCode) {
  const fields = [];

  const regex =
    /(?:^|,)\s*(?:"([^"]+)"|'([^']+)'|([A-Za-z_$][\w$]*))\s*:\s*Joi\.(string|number|integer|boolean|array|object|date|alternatives)\s*\(/g;

  let match;

  while ((match = regex.exec(objectCode))) {
    const name =
      match[1] ||
      match[2] ||
      match[3];

    const type = match[4];

    const start =
      match.index +
      match[0].length;

    const remaining =
      objectCode.substring(start);

    const nextField =
      remaining.search(
        /,\s*(?:"[^"]+"|'[^']+'|[A-Za-z_$][\w$]*)\s*:/
      );

    let expression;

    if (nextField === -1) {
      expression = remaining;
    } else {
      expression =
        remaining.substring(
          0,
          nextField
        );
    }

    fields.push({
      name,
      type,
      expression,
    });
  }

  return fields;
}

// ======================================================
// CREATE SAMPLE VALUE FROM JOI
// ======================================================

function createJoiExample(field) {
  const {
    name,
    type,
    expression = "",
  } = field;

  // ====================================================
  // DEFAULT VALUE
  // ====================================================

  const defaultMatch =
    expression.match(
      /\.default\s*\(\s*([^)]*)\)/
    );

  if (defaultMatch) {
    let value =
      defaultMatch[1].trim();

    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    if (
      /^-?\d+(\.\d+)?$/.test(value)
    ) {
      return Number(value);
    }

    if (
      (value.startsWith('"') &&
        value.endsWith('"')) ||
      (value.startsWith("'") &&
        value.endsWith("'"))
    ) {
      return value.substring(
        1,
        value.length - 1
      );
    }
  }

  // ====================================================
  // STRING
  // ====================================================

  if (type === "string") {
    // MongoDB ObjectId

    if (
      /\.length\s*\(\s*24\s*\)/
        .test(expression) &&
      /\.hex\s*\(/.test(expression)
    ) {
      return "507f1f77bcf86cd799439011";
    }

    // Email

    if (
      /\.email\s*\(/.test(expression)
    ) {
      return "test@example.com";
    }

    // URL

    if (
      /\.uri\s*\(/.test(expression)
    ) {
      return "https://example.com";
    }

    // Pincode

    if (
      name.toLowerCase() === "pincode"
    ) {
      return "700001";
    }

    // Phone/mobile

    if (
      name
        .toLowerCase()
        .includes("mobile") ||
      name
        .toLowerCase()
        .includes("phone")
    ) {
      return "9876543210";
    }

    // Name

    if (
      name
        .toLowerCase()
        .includes("name")
    ) {
      return "Sample Name";
    }

    // Address

    if (
      name
        .toLowerCase()
        .includes("address")
    ) {
      return "Sample Address";
    }

    return "string";
  }

  // ====================================================
  // NUMBER
  // ====================================================

  if (
    type === "number" ||
    type === "integer"
  ) {
    // Better examples for location

    if (
      name.toLowerCase() ===
      "latitude"
    ) {
      return 22.5726;
    }

    if (
      name.toLowerCase() ===
      "longitude"
    ) {
      return 88.3639;
    }

    const min =
      expression.match(
        /\.min\s*\(\s*(-?\d+(?:\.\d+)?)\s*\)/
      );

    if (min) {
      return Number(min[1]);
    }

    return 0;
  }

  // ====================================================
  // BOOLEAN
  // ====================================================

  if (type === "boolean") {
    return true;
  }

  // ====================================================
  // ARRAY
  // ====================================================

  if (type === "array") {
    return [];
  }

  // ====================================================
  // OBJECT
  // ====================================================

  if (type === "object") {
    return {};
  }

  // ====================================================
  // DATE
  // ====================================================

  if (type === "date") {
    return new Date().toISOString();
  }

  // ====================================================
  // ALTERNATIVES
  // ====================================================

  if (type === "alternatives") {
    return null;
  }

  return "string";
}

// ======================================================
// GENERATE REQUEST BODY
// ======================================================

function generateBody(
  routeFile,
  middleware
) {
  const schemaName =
    findSchemaName(
      routeFile,
      middleware
    );

  if (!schemaName) {
    console.log(
      "    Schema: none"
    );

    return {};
  }

  console.log(
    `    Schema: ${schemaName}`
  );

  const validatorFile =
    findSchemaFile(schemaName);

  if (!validatorFile) {
    console.log(
      "    Validator: NOT FOUND"
    );

    return {};
  }

  console.log(
    `    Validator: ${validatorFile}`
  );

  const code =
    readFile(validatorFile);

  const objectCode =
    extractJoiObject(
      code,
      schemaName
    );

  if (!objectCode) {
    console.log(
      "    Joi object: NOT FOUND"
    );

    return {};
  }

  const fields =
    extractJoiFields(objectCode);

  console.log(
    `    Fields: ${fields.length}`
  );

  const body = {};

  for (const field of fields) {
    body[field.name] =
      createJoiExample(field);
  }

  return body;
}

// ======================================================
// CONVERT EXPRESS PATH TO POSTMAN PATH
//
// /update/:id
//
// becomes
//
// /update/{{id}}
//
// ======================================================

function convertPath(routePath) {
  return routePath
    .split("/")
    .map((part) => {
      if (part.startsWith(":")) {
        return `{{${part.substring(
          1
        )}}}`;
      }

      return part;
    })
    .join("/");
}

// ======================================================
// CREATE POSTMAN URL
// ======================================================

function createUrl(fullPath) {
  return {
    raw: `{{baseUrl}}${fullPath}`,

    host: ["{{baseUrl}}"],

    path: fullPath
      .split("/")
      .filter(Boolean),
  };
}

// ======================================================
// CREATE POSTMAN REQUEST
// ======================================================

function createRequest(
  route,
  fullPath,
  routeFile
) {
  const request = {
    name: `${route.method} ${fullPath}`,

    request: {
      method: route.method,

      header: [
        {
          key: "Authorization",
          value:
            "Bearer {{accessToken}}",
          type: "text",
        },
      ],

      url: createUrl(fullPath),
    },
  };

  // ====================================================
  // BODY FOR POST / PUT / PATCH
  // ====================================================

  if (
    ["POST", "PUT", "PATCH"].includes(
      route.method
    )
  ) {
    request.request.header.push({
      key: "Content-Type",
      value: "application/json",
      type: "text",
    });

    const body = generateBody(
      routeFile,
      route.middleware
    );

    request.request.body = {
      mode: "raw",

      raw: JSON.stringify(
        body,
        null,
        2
      ),

      options: {
        raw: {
          language: "json",
        },
      },
    };
  }

  return request;
}

// ======================================================
// GENERATE POSTMAN COLLECTION
// ======================================================

function generatePostmanCollection() {
  console.log(
    "======================================"
  );

  console.log(
    " Anganwadi Postman Collection Generator"
  );

  console.log(
    "======================================"
  );

  console.log(
    "\nReading routes/index.js..."
  );

  const mounts =
    getRouteMounts();

  console.log(
    `Found ${mounts.length} route groups.`
  );

  const folders = [];

  let totalRoutes = 0;

  // ====================================================
  // ROUTE GROUPS
  // ====================================================

  for (const mount of mounts) {
    console.log(
      "\n======================================"
    );

    console.log(
      `Scanning ${mount.prefix}`
    );

    const routeFile =
      resolveRouteFile(
        mount.importPath
      );

    if (!routeFile) {
      console.log(
        "Route file not found"
      );

      continue;
    }

    console.log(
      `File: ${routeFile}`
    );

    const routes =
      extractRoutes(routeFile);

    console.log(
      `Found ${routes.length} APIs`
    );

    const folder = {
      name:
        mount.prefix
          .replace(/^\/+/, "")
          .replace(/\/+$/, "") ||
        "General",

      item: [],
    };

    // ==================================================
    // CREATE REQUESTS
    // ==================================================

    for (const route of routes) {
      const convertedPath =
        convertPath(route.path);

      const fullPath =
        `${API_PREFIX}${mount.prefix}${convertedPath}`
          .replace(/\/+/g, "/");

      console.log(
        `\n  ${route.method} ${fullPath}`
      );

      const request =
        createRequest(
          route,
          fullPath,
          routeFile
        );

      folder.item.push(request);

      totalRoutes++;
    }

    // Don't create empty folders
    if (folder.item.length > 0) {
      folders.push(folder);
    }
  }

  // ====================================================
  // COLLECTION
  // ====================================================

  const collection = {
    info: {
      name: "Anganwadi API",

      description:
        "Generated automatically from Express routes and Joi validators.",

      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },

    variable: [
      {
        key: "baseUrl",
        value: BASE_URL,
        type: "string",
      },

      {
        key: "accessToken",
        value: "",
        type: "string",
      },
    ],

    item: folders,
  };

  // ====================================================
  // WRITE FILE
  // ====================================================

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(
      collection,
      null,
      2
    ),
    "utf8"
  );

  console.log(
    "\n======================================"
  );

  console.log(" DONE");

  console.log(
    "======================================"
  );

  console.log(
    `Total APIs: ${totalRoutes}`
  );

  console.log(
    `Collection: ${OUTPUT_FILE}`
  );
}

// ======================================================
// RUN
// ======================================================

try {
  generatePostmanCollection();
} catch (error) {
  console.error(
    "\nPostman generation failed:"
  );

  console.error(error);

  process.exit(1);
}