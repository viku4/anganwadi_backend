export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: true, // ✅ IMPORTANT
  });

  if (error) {
    console.log(error);

    return res.status(400).json({
      message: error.details[0].message.replace(/\"/g, ""),
      data: null,
    });
  }

  next();
};
