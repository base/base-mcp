require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { ethers } = require('ethers');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Environment variables
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';

// Initialize bot with HTML parsing mode
const bot = new TelegramBot(TOKEN, { polling: true, parse_mode: 'HTML' });

// Initialize ethers provider
const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);

// User session state
const userSessions = {};
const userSettings = {};

// Create receipts directory if it doesn't exist
const receiptsDir = path.join(__dirname, 'receipts');
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir);
}

// Create settings directory if it doesn't exist
const settingsDir = path.join(__dirname, 'settings');
if (!fs.existsSync(settingsDir)) {
  fs.mkdirSync(settingsDir);
}

// Create logos directory if it doesn't exist
const logosDir = path.join(__dirname, 'logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir);
}

// Load user settings if they exist
const loadUserSettings = (chatId) => {
  const settingsPath = path.join(settingsDir, `user_${chatId}.json`);
  if (fs.existsSync(settingsPath)) {
    try {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      userSettings[chatId] = settings;
      return settings;
    } catch (error) {
      console.error('Error loading user settings:', error);
      return null;
    }
  }
  return null;
};

// Save user settings
const saveUserSettings = (chatId, settings) => {
  const settingsPath = path.join(settingsDir, `user_${chatId}.json`);
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    userSettings[chatId] = settings;
  } catch (error) {
    console.error('Error saving user settings:', error);
  }
};

// Download logo from Telegram
const downloadLogo = async (fileId, chatId) => {
  try {
    // Get file path from Telegram
    const file = await bot.getFile(fileId);
    const filePath = file.file_path;
    
    // Create user logos directory if it doesn't exist
    const userLogosDir = path.join(logosDir, `user_${chatId}`);
    if (!fs.existsSync(userLogosDir)) {
      fs.mkdirSync(userLogosDir);
    }
    
    // Download the file
    const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;
    const logoPath = path.join(userLogosDir, 'logo.jpg');
    
    const response = await axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(logoPath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        // Save logo path in user settings
        const settings = loadUserSettings(chatId) || {};
        settings.logoPath = logoPath;
        saveUserSettings(chatId, settings);
        resolve(logoPath);
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading logo:', error);
    throw error;
  }
};

// Format address for display (truncate with ellipsis)
const formatAddress = (address) => {
  if (!address) return 'N/A';
  return `<code>${address.substring(0, 6)}...${address.substring(address.length - 4)}</code>`;
};

// Format full address or hash (full monospace)
const formatFullAddress = (address) => {
  if (!address) return 'N/A';
  return `<code>${address}</code>`;
};

// Welcome message with inline buttons
const sendWelcomeMessage = (chatId) => {
  // Load user settings
  loadUserSettings(chatId);
  
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🔍 Verify Transaction', callback_data: 'verify_transaction' },
          { text: '📃 Past Receipts', callback_data: 'past_receipts' }
        ],
        [
          { text: '💸 Send Crypto', callback_data: 'send_crypto' },
          { text: '📥 Receive Payment', callback_data: 'receive_payment' }
        ],
        [
          { text: '⚙️ Settings', callback_data: 'settings' }
        ]
      ]
    },
    parse_mode: 'HTML'
  };

  bot.sendMessage(
    chatId,
    `<b>Base Blockchain Receipt Generator</b>\n\n` +
    `Generate professional transaction receipts for Base network transactions. Verify transactions, customize with your business name and logo, and get PDF receipts instantly.\n\n` + 
    `<i>Coming soon: Send and receive Base tokens directly through this bot!</i>`,
    options
  );
};

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  sendWelcomeMessage(chatId);
});

// Handle inline button clicks
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const action = callbackQuery.data;

  // Acknowledge the callback query
  await bot.answerCallbackQuery(callbackQuery.id);

  if (action === 'verify_transaction') {
    // Start transaction verification process
    userSessions[chatId] = {
      state: 'awaitingTransactionId'
    };
    
    bot.sendMessage(
      chatId, 
      'Please paste the Base transaction hash you want to verify:',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
          ]
        }
      }
    );
  } 
  else if (action === 'settings') {
    // Load user settings
    const settings = loadUserSettings(chatId) || {};
    const businessName = settings.businessName || 'Not set';
    const baseAddress = settings.baseAddress || 'Not set';
    const hasLogo = settings.logoPath && fs.existsSync(settings.logoPath);
    
    let logoStatus = 'Not uploaded';
    if (hasLogo) {
      logoStatus = 'Uploaded ✅';
    }
    
    bot.sendMessage(
      chatId,
      `<b>⚙️ Settings</b>\n\n` +
      `<b>Business Name:</b> ${businessName === 'Not set' ? 'Not set' : `"${businessName}"`}\n` +
      `<b>Logo:</b> ${logoStatus}\n` +
      `<b>Base Address:</b> ${baseAddress === 'Not set' ? 'Not set' : formatAddress(baseAddress)}\n\n` +
      `These settings will appear on all your generated receipts.`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '✏️ Set Business Name', callback_data: 'set_business_name' }],
            [{ text: '🖼️ Upload Logo', callback_data: 'upload_logo' }],
            [{ text: '💼 Set Base Address', callback_data: 'set_base_address' }],
            [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
          ]
        },
        parse_mode: 'HTML'
      }
    );
  }
  else if (action === 'set_business_name') {
    userSessions[chatId] = {
      state: 'awaitingBusinessName'
    };
    
    bot.sendMessage(
      chatId,
      '<b>✏️ Set Business Name</b>\n\nPlease enter your business name that will appear on receipts:\n\n<i>Example: "Crypto Solutions Inc." or "John\'s Web Services"</i>',
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Settings', callback_data: 'settings' }]
          ]
        }
      }
    );
  }
  else if (action === 'upload_logo') {
    userSessions[chatId] = {
      state: 'awaitingLogo'
    };
    
    bot.sendMessage(
      chatId,
      '<b>🖼️ Upload Logo</b>\n\nPlease send your business logo as an image. For best results:\n\n• Use a square or landscape image\n• Make sure it\'s clear at small sizes\n• PNG or JPG format\n\nYour logo will appear at the top of receipts.',
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Settings', callback_data: 'settings' }]
          ]
        }
      }
    );
  }
  else if (action === 'past_receipts') {
    // Show past receipts
    const userReceiptsDir = path.join(receiptsDir, `user_${chatId}`);
    
    if (!fs.existsSync(userReceiptsDir) || fs.readdirSync(userReceiptsDir).length === 0) {
      bot.sendMessage(
        chatId, 
        'You have no past receipts.',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
            ]
          }
        }
      );
      return;
    }
    
    const receiptFiles = fs.readdirSync(userReceiptsDir)
      .filter(file => file.endsWith('.pdf'))
      .sort((a, b) => {
        return fs.statSync(path.join(userReceiptsDir, b)).mtime.getTime() - 
               fs.statSync(path.join(userReceiptsDir, a)).mtime.getTime();
      })
      .slice(0, 5); // Show only the 5 most recent receipts
    
    const buttons = receiptFiles.map(file => {
      // Extract transaction hash from filename
      const txHash = file.replace('receipt-', '').replace('.pdf', '');
      return [{ text: `Receipt: ${txHash}`, callback_data: `receipt_${txHash}` }];
    });
    
    // Add back button
    buttons.push([{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]);
    
    bot.sendMessage(
      chatId,
      '<b>Your recent receipts:</b>',
      {
        reply_markup: {
          inline_keyboard: buttons
        },
        parse_mode: 'HTML'
      }
    );
  }
  else if (action.startsWith('receipt_')) {
    // Send the specific receipt
    const txHash = action.replace('receipt_', '');
    const userReceiptsDir = path.join(receiptsDir, `user_${chatId}`);
    const receiptPath = path.join(userReceiptsDir, `receipt-${txHash}.pdf`);
    
    if (fs.existsSync(receiptPath)) {
      bot.sendDocument(chatId, receiptPath, {
        caption: `Receipt for transaction <code>${txHash}</code>`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Receipts', callback_data: 'past_receipts' }]
          ]
        }
      });
    } else {
      bot.sendMessage(
        chatId,
        'Receipt not found.',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 Back to Receipts', callback_data: 'past_receipts' }]
            ]
          }
        }
      );
    }
  }
  else if (action === 'back_to_menu') {
    // Clear user session
    delete userSessions[chatId];
    
    // Go back to main menu
    sendWelcomeMessage(chatId);
  }
  else if (action === 'send_crypto') {
    bot.sendMessage(
      chatId,
      `<b>🚧 Coming Soon! 🚧</b>\n\nThe ability to send crypto directly through this bot is coming in a future update. Stay tuned!`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
          ]
        }
      }
    );
  }
  else if (action === 'receive_payment') {
    bot.sendMessage(
      chatId,
      `<b>🚧 Coming Soon! 🚧</b>\n\nThe ability to receive payments directly through this bot is coming in a future update. Stay tuned!`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
          ]
        }
      }
    );
  }
  else if (action === 'set_base_address') {
    userSessions[chatId] = {
      state: 'awaitingBaseAddress'
    };
    
    bot.sendMessage(
      chatId,
      '<b>💼 Set Base Address</b>\n\nPlease enter your Base network wallet address:\n\n<i>Example: "0x1234567890abcdef1234567890abcdef12345678"</i>\n\nThis address can be used for future crypto payment features.',
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Settings', callback_data: 'settings' }]
          ]
        }
      }
    );
  }
});

// Handle photo upload for logo
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const session = userSessions[chatId];
  
  if (!session || session.state !== 'awaitingLogo') return;
  
  try {
    // Get the largest photo size
    const photo = msg.photo[msg.photo.length - 1];
    const fileId = photo.file_id;
    
    // First show a typing indicator
    bot.sendChatAction(chatId, 'typing');
    
    // Download the logo
    await downloadLogo(fileId, chatId);
    
    // Send confirmation
    bot.sendMessage(
      chatId,
      '✅ <b>Logo successfully uploaded!</b>\n\nYour business logo will now appear on all your generated receipts.',
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '⚙️ View Settings', callback_data: 'settings' }],
            [{ text: '🏠 Back to Main Menu', callback_data: 'back_to_menu' }]
          ]
        }
      }
    );
    
    // Clear session
    delete userSessions[chatId];
    
  } catch (error) {
    console.error('Error handling logo upload:', error);
    bot.sendMessage(
      chatId, 
      'Error uploading logo. Please try again with a different image.',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Settings', callback_data: 'settings' }]
          ]
        }
      }
    );
  }
});

// Handle text input (for transaction ID and receipt details)
bot.on('text', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Skip command messages
  if (text.startsWith('/')) return;
  
  const session = userSessions[chatId];
  if (!session) return;
  
  if (session.state === 'awaitingBusinessName') {
    // User is setting their business name
    const businessName = text.trim();
    
    if (businessName.length > 50) {
      bot.sendMessage(
        chatId,
        'Business name is too long. Please enter a name under 50 characters.',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 Back to Settings', callback_data: 'settings' }]
            ]
          }
        }
      );
      return;
    }
    
    // First show a typing indicator
    bot.sendChatAction(chatId, 'typing');
    
    // Save the business name
    const settings = userSettings[chatId] || {};
    settings.businessName = businessName;
    saveUserSettings(chatId, settings);
    
    // Send confirmation with check mark emoji
    bot.sendMessage(
      chatId,
      `✅ <b>Business name successfully saved!</b>\n\nYour business name has been updated to: <b>"${businessName}"</b>\n\nThis name will appear on all your generated receipts.`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '⚙️ View Settings', callback_data: 'settings' }],
            [{ text: '🏠 Back to Main Menu', callback_data: 'back_to_menu' }]
          ]
        }
      }
    );
    
    // Clear session
    delete userSessions[chatId];
  }
  else if (session.state === 'awaitingLogo') {
    // Prompt user to send logo as photo
    bot.sendMessage(
      chatId,
      'Please send your business logo as a photo/image (not as a text message).',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Settings', callback_data: 'settings' }]
          ]
        }
      }
    );
  }
  else if (session.state === 'awaitingTransactionId') {
    // User has sent a transaction ID
    try {
      const txId = text.trim();
      
      bot.sendMessage(chatId, `Verifying transaction <code>${txId}</code>...`, { parse_mode: 'HTML' });
      
      // Fetch transaction details from Base network
      const txReceipt = await provider.getTransactionReceipt(txId);
      
      if (!txReceipt) {
        return bot.sendMessage(
          chatId, 
          "Transaction not found. Please check the transaction ID and try again.",
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
              ]
            }
          }
        );
      }
      
      const tx = await provider.getTransaction(txId);
      
      if (txReceipt.status === 1) {
        // Format the amount
        const amountEth = ethers.formatEther(tx.value);
        
        bot.sendMessage(
          chatId,
          `✅ <b>Transaction verified successfully!</b>\n\n` +
          `<b>Transaction details:</b>\n` +
          `• <b>Hash:</b> ${formatFullAddress(txId)}\n` +
          `• <b>Block:</b> <code>${txReceipt.blockNumber}</code>\n` +
          `• <b>Status:</b> Success\n` +
          `• <b>From:</b> ${formatFullAddress(tx.from)}\n` +
          `• <b>To:</b> ${formatFullAddress(tx.to)}\n` +
          `• <b>Amount:</b> <code>${amountEth} ETH</code>\n\n` +
          `Now, please enter the receipt details:\n\n` +
          `<b>First line:</b> Buyer name\n` +
          `<b>Second line:</b> Product details\n\n` +
          `<i>Example:</i>\n` +
          `<code>John Doe\nBase Network Course</code>`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
              ]
            },
            parse_mode: 'HTML'
          }
        );
        
        // Update user session
        userSessions[chatId] = {
          state: 'awaitingReceiptDetails',
          transaction: {
            hash: txId,
            blockNumber: txReceipt.blockNumber,
            from: tx.from,
            to: tx.to,
            value: amountEth
          }
        };
      } else {
        bot.sendMessage(
          chatId, 
          "❌ Transaction failed. Cannot generate receipt for failed transactions.",
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
              ]
            }
          }
        );
      }
    } catch (error) {
      console.error('Error verifying transaction:', error);
      bot.sendMessage(
        chatId, 
        `Error verifying transaction: ${error.message}`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
            ]
          }
        }
      );
    }
  } 
  else if (session.state === 'awaitingReceiptDetails') {
    try {
      bot.sendMessage(chatId, "Generating your receipt...");
      
      // Generate PDF receipt
      const receiptDetails = text.trim();
      const receiptPath = await generateReceipt(session.transaction, receiptDetails, chatId);
      
      // Send PDF to user
      bot.sendDocument(chatId, receiptPath, {
        caption: "Here's your receipt for the verified transaction!",
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
          ]
        }
      });
      
      // Reset session
      delete userSessions[chatId];
      
    } catch (error) {
      console.error('Error generating receipt:', error);
      bot.sendMessage(
        chatId, 
        `Error generating receipt: ${error.message}`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
            ]
          }
        }
      );
    }
  }
  else if (session.state === 'awaitingBaseAddress') {
    // User is setting their Base address
    const baseAddress = text.trim();
    
    // Simple validation for ETH address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(baseAddress)) {
      bot.sendMessage(
        chatId,
        'Invalid Base address format. Please enter a valid Ethereum address (0x followed by 40 hexadecimal characters).',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 Back to Settings', callback_data: 'settings' }]
            ]
          }
        }
      );
      return;
    }
    
    // First show a typing indicator
    bot.sendChatAction(chatId, 'typing');
    
    // Save the Base address
    const settings = userSettings[chatId] || {};
    settings.baseAddress = baseAddress;
    saveUserSettings(chatId, settings);
    
    // Send confirmation with check mark emoji
    bot.sendMessage(
      chatId,
      `✅ <b>Base address successfully saved!</b>\n\nYour Base address has been set to:\n${formatFullAddress(baseAddress)}`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '⚙️ View Settings', callback_data: 'settings' }],
            [{ text: '🏠 Back to Main Menu', callback_data: 'back_to_menu' }]
          ]
        }
      }
    );
    
    // Clear session
    delete userSessions[chatId];
  }
});

// Handle the /verify command for backward compatibility
bot.onText(/\/verify (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const txId = match[1];
  
  // Simulate the verification process as if it came from the inline button flow
  userSessions[chatId] = {
    state: 'awaitingTransactionId'
  };
  
  // Trigger the verification process by simulating text input
  bot.emit('text', { chat: { id: chatId }, text: txId });
});

// Generate PDF receipt and save a copy
async function generateReceipt(transaction, details, chatId) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      
      // Create user directory if it doesn't exist
      const userDir = path.join(receiptsDir, `user_${chatId}`);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir);
      }
      
      // Create filename with transaction hash
      const fileName = `receipt-${transaction.hash.substring(0, 16)}.pdf`;
      const tempPath = path.join(__dirname, fileName); // Temporary file for sending
      const savedPath = path.join(userDir, fileName); // Permanent saved copy
      
      const writeStream = fs.createWriteStream(tempPath);
      
      doc.pipe(writeStream);
      
      // Get user settings
      const settings = loadUserSettings(chatId) || {};
      const businessName = settings.businessName || 'Base Network';
      const logoPath = settings.logoPath;
      
      // Check if user has a logo
      if (logoPath && fs.existsSync(logoPath)) {
        // Add logo with appropriate sizing
        try {
          // Get page dimensions
          const pageWidth = doc.page.width - 2 * doc.page.margins.left;
          const logoWidth = 200;
          const logoX = (pageWidth - logoWidth) / 2 + doc.page.margins.left;
          
          // Center the logo horizontally
          doc.image(logoPath, logoX, doc.y, {
            fit: [logoWidth, 100],
            align: 'center'
          });
          doc.moveDown(2);
        } catch (error) {
          console.error('Error adding logo to PDF:', error);
        }
      }
      
      // Add business name first
      doc.fontSize(30).text(businessName, { align: 'center' });
      doc.moveDown();
      
      // Add receipt header after business name
      doc.fontSize(22).text('Transaction Receipt', { align: 'center' });
      doc.moveDown();
      
      // Add transaction details with improved formatting
      doc.fontSize(18).text('Transaction Details:', { underline: true });
      doc.moveDown(0.5);
      
      // Use a monospaced font for addresses
      doc.font('Courier');
      doc.fontSize(12);
      doc.text(`Transaction Hash: ${transaction.hash}`);
      doc.text(`Block Number: ${transaction.blockNumber}`);
      doc.text(`From: ${transaction.from}`);
      doc.text(`To: ${transaction.to}`);
      doc.text(`Amount: ${transaction.value} ETH`);
      doc.moveDown();
      
      // Switch back to default font for remaining content
      doc.font('Helvetica');
      
      // Parse buyer and product details
      let buyerName = 'Not specified';
      let productDetails = 'Not specified';
      
      // Split the text by line breaks
      const lines = details.split(/\r?\n/).filter(line => line.trim().length > 0);
      
      if (lines.length >= 1) {
        buyerName = lines[0].trim();
        
        if (lines.length >= 2) {
          productDetails = lines[1].trim();
        }
      }
      
      // Add receipt details with structured format
      doc.fontSize(18).text('Receipt Details:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(14);
      doc.text(`Buyer: ${buyerName}`);
      doc.text(`Product: ${productDetails}`);
      doc.text(`Amount Paid: ${transaction.value} ETH`);
      
      // Add date
      doc.moveDown();
      doc.fontSize(14).text(`Generated: ${new Date().toLocaleString()}`);
      
      // Finalize document
      doc.end();
      
      writeStream.on('finish', () => {
        // Save a copy for past receipts
        fs.copyFileSync(tempPath, savedPath);
        
        resolve(tempPath);
      });
      
      writeStream.on('error', (err) => {
        reject(err);
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

// Cancel command
bot.onText(/\/cancel/, (msg) => {
  const chatId = msg.chat.id;
  if (userSessions[chatId]) {
    delete userSessions[chatId];
    bot.sendMessage(chatId, "Current operation cancelled.");
    sendWelcomeMessage(chatId);
  } else {
    bot.sendMessage(chatId, "No active operation to cancel.");
  }
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('Base Receipt Bot is running...'); 