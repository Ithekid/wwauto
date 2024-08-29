
const { Client, LocalAuth } = require('whatsapp-web.js');
//const client = new Client({
//    authStrategy: new LocalAuth()
//})


const client = new Client();


const  {openFile}  = require('macos-open-file-dialog');
const fs = require('fs')
const os = require('os')
const PathofFile = null

const readline = require('node:readline');
const rl = readline.createInterface({
    input: process.stdin,   
    output: process.stdout,
  });
global.pathfile = null

global.contacts = []


const qrcode = require('qrcode-terminal');

//Random function for delay between 3-10 secs
const rand = Math.random() * (10000 - 3000) + 3000;
var interval = rand;
var promise = Promise.resolve();



//Open file selection dialog on Mac
async function macOpenFile(){
    const filePath = await openFile("open File")
    global.pathfile = filePath
    return filePath
}

//Interconnecting function for logic
async function runner(){
    await macOpenFile()
    await getContacts(global.pathfile)

    return
}


//Main(), checks OS of user and performs subsequent actions.
if(os.platform == "win32")
    //Windows' file dialog (NOT TESTED)
    {
    const dialog = require('node-file-dialog');
    const config={type:'directory'}
    dialog(config)
    .then(dir => global.pathfile = dir)
    .catch(err => console.log(err))
    body()
    }
    else if (os.platform == "darwin")
    //Mac file dialog
        {
    runner()
    body()
    }
    


//Function to read phone numbers from excel sheet selected
async function getContacts(pathoffile){
const Excel = require('exceljs')
const workbook = new Excel.Workbook();
await workbook.xlsx.readFile(pathoffile)
const worksheet = workbook.getWorksheet('Sheet1')
const dobCol = worksheet.getColumn(1)
dobCol.eachCell(function(cell,rowNumber){
    global.contacts.push(cell.value)
})
console.log(`Phone Numbers: ${global.contacts}`)
return global.contacts
}


//WWebjs boogaloo
async function body(contacts){
    //QR generation
    client.on('qr', (qr) => {
        qrcode.generate(qr, {small: true});
        console.log("Open Whatsapp Web and scan the code (Make sure to fullscreen such that the entire code is shown!)")
    });

    client.initialize();
    //Message after initialization (linked)
    client.on('ready', () => {
        console.log('Whatsapp linked. Using ANOTHER PHONE, put "!check" in front of the template message and send it to the WORKPHONE');
        console.log("Be sure to add a space inbetween the !check and the actual message!")
        console.log("Example:")
        console.log(`\x1b[36m%s\x1b[0m`,"!check Hi how are you im fine thank you hi ")
    });
    //Command receiving function
    client.on('message', async msg => {
    
        if (msg.body.startsWith('!check')) {
            let number = msg.body.split(' ')[1];
            let messageIndex = msg.body.indexOf(number);
            let message = msg.body.slice(messageIndex, msg.body.length);
            
            rl.question(`${message} \n Is this message correct? (y/n) Press y or n and enter: `, stat =>{
                if (stat === "Y" || stat === "y") {
                    console.log("Confirmed, sending messages.")
                    console.log(`\x1b[31m%s\x1b[1m`,'!!DO NOT CLOSE THIS WINDOW!!')
                    
                    var i = 0
                    global.contacts.forEach(function (el) {
                        
                        promise = promise.then(function () {
                            const number = "+852"+el;
                   
                           const text = message;
                           
                          
                            // Getting chatId from the number.
                           const chatId = number.substring(1) + "@c.us";
                          
                           // Sending message
                           client.sendMessage(chatId, text);
                           console.log(`\x1b[31m%s\x1b[1m\x1b[0m`,'!!DO NOT CLOSE THIS WINDOW!!')
                           console.log(`\x1b[31m%s\x1b[1m\x1b[0m`,'Dont worry if it looks stuck. it is not!')
                           i++
                        console.log(`${i} of ${global.contacts.length}...`)
                        if(i == global.contacts.length){
                        console.log(`\x1b[32m%s\x1b[4m\x1b[0m`,'All done! you can close the window now :)')
                        }

                           return new Promise(function (resolve){
                            setTimeout(resolve, interval);
                           });
                        });
                        
                    
                    });
                    
                }
                else{
                    console.log("Session terminated. Waiting for command");
                }
            })
    
        }
    
    })

}



