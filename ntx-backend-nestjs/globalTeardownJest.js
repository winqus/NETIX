const fs = require('fs');
const path = require('path');

module.exports = async () => {
  try {
    const tempDir = path.resolve(__dirname, '.temp-test-data');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  } catch (error) {
    console.log('Error in globalTeardownJest.js:', error.message);
  }
};
