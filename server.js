const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.static(__dirname));

const DB_FILE = path.join(__dirname, 'db.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Helper to read JSON files safely
function readJsonFile(filePath, defaultData = {}) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return defaultData;
  }
}

// Helper to write JSON files safely
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
}

// --- DATABASE API ---
app.get('/api/db', (req, res) => {
  const dbData = readJsonFile(DB_FILE, {});
  res.json(dbData);
});

app.post('/api/save-db', (req, res) => {
  const newDbData = req.body;
  if (!newDbData || typeof newDbData !== 'object') {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ.' });
  }
  
  const success = writeJsonFile(DB_FILE, newDbData);
  if (success) {
    res.json({ message: 'Lưu cơ sở dữ liệu thành công!' });
  } else {
    res.status(500).json({ error: 'Không thể ghi tệp cơ sở dữ liệu.' });
  }
});

// --- AUTHENTICATION API ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng cung cấp số điện thoại và mật khẩu.' });
  }
  
  const dbData = readJsonFile(DB_FILE, {});
  const adminConfig = dbData.admin || { username: "0344582293", password: "123" };
  
  if (username === adminConfig.username && password === adminConfig.password) {
    res.json({ success: true, message: 'Đăng nhập thành công!' });
  } else {
    res.status(401).json({ error: 'Số điện thoại hoặc mật khẩu không chính xác.' });
  }
});

// --- LOGO UPLOAD API ---
app.post('/api/upload-logo', (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'Không tìm thấy dữ liệu hình ảnh logo.' });
  }
  
  const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
  const logoPath = path.join(__dirname, 'assets', 'images', 'logo.png');
  
  // Ensure folder exists
  const dir = path.dirname(logoPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFile(logoPath, base64Data, 'base64', (err) => {
    if (err) {
      console.error('Error writing logo file:', err);
      return res.status(500).json({ error: 'Lỗi ghi file hình ảnh logo.' });
    }
    res.json({ success: true, logoUrl: 'assets/images/logo.png' });
  });
});

// --- ORDERS API ---
app.get('/api/orders', (req, res) => {
  const orders = readJsonFile(ORDERS_FILE, []);
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const order = req.body;
  if (!order || !order.fullname || !order.phone) {
    return res.status(400).json({ error: 'Thông tin đơn hàng không đầy đủ.' });
  }
  
  const orders = readJsonFile(ORDERS_FILE, []);
  
  // Set meta details
  order.id = 'ord-' + Date.now();
  order.createdAt = new Date().toISOString();
  order.status = 'Đang xử lý'; // Default status
  
  orders.unshift(order); // Add to the beginning of the list
  
  const success = writeJsonFile(ORDERS_FILE, orders);
  if (success) {
    res.status(201).json({ message: 'Đặt hàng thành công!', order });
  } else {
    res.status(500).json({ error: 'Không thể lưu thông tin đơn hàng.' });
  }
});

app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Trạng thái không hợp lệ.' });
  }
  
  const orders = readJsonFile(ORDERS_FILE, []);
  const orderIndex = orders.findIndex(o => o.id === id);
  
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
  }
  
  orders[orderIndex].status = status;
  
  const success = writeJsonFile(ORDERS_FILE, orders);
  if (success) {
    res.json({ message: 'Cập nhật trạng thái đơn hàng thành công!', order: orders[orderIndex] });
  } else {
    res.status(500).json({ error: 'Không thể cập nhật trạng thái đơn hàng.' });
  }
});

// Fallback to serve index.html for undefined routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`myMoon Server is running on http://localhost:${PORT}`);
});
