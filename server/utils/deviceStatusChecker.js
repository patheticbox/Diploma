const cron = require('node-cron');
const Device = require('../models/Device');

function startDeviceStatusChecker() {
  cron.schedule('* * * * *', async () => {
    const devices = await Device.find();
    const now = new Date();
    const threshold = 30 * 1000; // 30 секунд

    for (let device of devices) {
      const diff = now - new Date(device.lastActivity);
      if (diff > threshold && device.status !== 'offline') {
        device.status = 'offline';
        await device.save();
        console.log(`📴 Пристрій "${device.serialNumber}" переведено в offline`);
      }
    }
  });

  console.log('⏱️ Device status checker запущено!');
}

module.exports = startDeviceStatusChecker;