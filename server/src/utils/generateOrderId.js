const generateOrderId = () => {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `MR-${year}-${randomPart}`;
};

module.exports = generateOrderId;
