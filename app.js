const { unlink } = require('fs/promises');
const fs = require('fs/promises');

(async () => {
  const createFile = async (filePath) => {
    try {
      // we want to check wether we have that file already
      const existingFileHandler = await fs.open(filePath, 'r');

      // we already have the file
      console.log(`the filepath ${filePath}  already exists`);
      existingFileHandler.close();
    } catch (error) {
      // we don't have the file, so we should create it
      // 'w' is for write operation
      const newFileHandler = await fs.open(filePath, 'w');
      console.log(`a new file has been created`);
      newFileHandler.close();
    }
  };

  const deleteFile = async (filePath) => {
    try {
      // we want to check wether the file exists
      const existingFileHandler = await fs.open(filePath, 'r');
      existingFileHandler.close();

      // we have the file, so we should delete it
      const deletedFileHandler = await unlink(filePath);

      return console.log(`the file ${filePath} has been successfully deleted`);

      deletedFileHandler.close();
    } catch (error) {
      console.log(`the filepath ${filePath}  does not exist!`);
    }
  };

  const renameFile = async (filePath, newFilePath) => {
    try {
      // we want to check wether the file exists
      const existingFileHandler = await fs.open(filePath, 'r');
      existingFileHandler.close();

      // we have the file, so we should rename it
      const renamedFileHandler = await fs.rename(filePath, newFilePath);

      console.log(
        `the file ${filePath} has been successfully renamed to ${newFilePath}`
      );

      renamedFileHandler.close();
    } catch (error) {
      console.log(`the filepath ${filePath}  does not exist!`);
    }
  };

  const addToFile = async (filePath, content) => {
    try {
      // we can append to the filepath, but if it doesn't exist, it will create it
      const addedContentToFileHandler = await fs.appendFile(filePath, content);

      console.log(
        `the content: "${content}" has been successfully added to the file ${filePath}`
      );

      addedContentToFileHandler.close();
    } catch (error) {
      console.log(
        `couldn't add the content: "${content}" to the file ${filePath}!`
      );
    }
  };

  //commands
  const CREATE_FILE = 'create a file';
  const DELETE_FILE = 'delete a file';
  const RENAME_FILE = 'rename a file';
  const ADD_TO_FILE = 'add to a file';

  // open the file -> getting its file descriptor (numeric value)
  // 'r' is for read only
  const commandFileHandler = await fs.open('./command.txt', 'r');

  commandFileHandler.on('change', async () => {
    // get the size of the file
    const size = (await commandFileHandler.stat()).size;

    // allocate out buffer with the same size of the file
    const buff = Buffer.alloc(size);

    // the location at which we want to start filling our buffer
    const offset = 0;

    // the number of bytes to read
    const length = size;

    // the position from where to read the file
    const position = 0;

    // read the content
    await commandFileHandler.read(buff, offset, length, position);

    // decoder takes 01 and converts it to something meaning ful
    // encoder takes something meaningful and turns it to 01

    // we want to run the content through a decoder
    command = buff.toString('utf-8');

    // create a file
    // create a file <path>

    if (command.includes(CREATE_FILE)) {
      const filePath = command.substring(CREATE_FILE.length + 1);
      createFile(filePath);
    }

    //delete a file
    // delete a file <path>

    if (command.includes(DELETE_FILE)) {
      const filePath = command.substring(DELETE_FILE.length + 1);
      deleteFile(filePath);
    }

    //rename a file
    // rename a file <path> <new path>
    if (command.includes(RENAME_FILE)) {
      const filePaths = command.substring(RENAME_FILE.length + 1);
      const filePath = filePaths.split(' ')[0];
      const newFilePath = filePaths.split(' ')[1];

      renameFile(filePath, newFilePath);
    }

    //add to a file
    // add to a file <path> <content>
    if (command.includes(ADD_TO_FILE)) {
      const filePathContent = command.substring(RENAME_FILE.length + 1);

      const filePath = filePathContent.split(' ')[0];
      const content = filePathContent.substring(filePath.length + 1) + ' ';

      addToFile(filePath, content);
    }
  });

  // fs.watch can watch a directory like './' or a file name
  const watcher = fs.watch('./command.txt');

  // this is an async iterator, but could also be used with the callback
  for await (const event of watcher) {
    if (event.eventType === 'change') {
      // using the event emitter to emit the change event
      commandFileHandler.emit('change');
    }
  }
})();
