const fileInput=document.getElementById('fileInput');
const fileError = document.getElementById('fileError');
//const startButton   = document.querySelector("#startUpload");
//const pauseButton   = document.querySelector("#pauseUpload");
//const resumeButton = document.querySelector("#resumeUpload");
const confirmDeleteButton = document.querySelector("#confirmDeleteButton");
const confirmStopButton = document.querySelector("#confirmStopButton");
//const stopButton = document.getElementById('stopUpload');
const chooseButton = document.getElementById('chooseFile');
const statusMessage = document.getElementById('statusMessage');
const progressBar = document.getElementById('uploadProgress');
const bytesTransferred = document.getElementById('bytesTransferred');
const selectFileButton=document.getElementById('selectFile');
const selectedFileLabel=document.getElementById('selectedFileName');
const fileDrop=document.getElementById('fileDrop');
const cpfNoInput=document.getElementById('cpfNo');

const deleteConfirmationLabel=document.getElementById('deleteConfirmationLabel');
const deleteConfirmationText=document.getElementById('deleteConfirmationText');

const opNotAllowedLabel=document.getElementById('opNotAllowedLabel');
const opNotAllowedText=document.getElementById('opNotAllowedText');

const resumptionFileLabel=document.getElementById('resumptionFileLabel');
const resumptionInfo=document.getElementById('resumptionInfo');

const renameButton = document.querySelector("#renameFile");

var resumptionFlag=false;
var fileToResume="";
resumptionInfo.style.display="none";

var upload;
var uploadFileId;
var file;
const allowedExtensions = ['.segy', '.sgy','.SEGY', '.SGY'];
const server_addr='localhost:3000';
const uploadEndpoint=`http://${server_addr}/files/`;
const fileListingEndpoint=`http://${server_addr}/pendinguploads`;
const fileExplorerEndpoint=`http://${server_addr}/segyfilelist`;
const fileExistCheckEndpoint=`http://${server_addr}/checkfileexists`;
const deletePendingUploadsEndpoint=`http://${server_addr}/deletePendingUploads`;
const deleteFilessEndpoint=`http://${server_addr}/deleteFiles`;
const renamePostUploadEndpoint=`http://${server_addr}/postUploadRename`;
const renameFileEndpoint=`http://${server_addr}/renameFile`;
var selectedFile = null;
fileInput.value="";
selectedFileLabel.value="";
fileDrop.textContent = "Drag and drop file here";
selectFileButton.disabled=true;
nameError.style.display="none";
nameError.textContent="";
updateButtonState('idle');

listCompletedFiles();





chooseButton.addEventListener("click", function() {  
    fileInput.value="";    
    fileDrop.textContent = "Drag and drop file here"; 
    resumptionFlag=false;
    fileToResume="";
    resumptionInfo.style.display="none";
    nameError.style.display="none";
    selectFileButton.disabled=true;
    $('#fileSelectionModal').modal('show');
})

fileInput.addEventListener('change', function(event) {
    selectedFile = event.target.files[0];   
    fileDrop.textContent = "Drag and drop file here"; 
    if(resumptionFlag){
        if(selectedFile.name!==fileToResume)
        {
            selectedFile=null;
            selectFileButton.disabled = true;            
            nameError.style.display="block";
            nameError.textContent="The file chosen has a name different than the upload being resumed";
        }
        else{
            nameError.style.display="none";
            nameError.textContent="";
            selectFileButton.disabled = false;            
        }
    }
    else{      
        nameError.style.display="none";
        nameError.textContent=""; 
        selectFileButton.disabled = false;        
    }
    
});

fileDrop.addEventListener('drop', function(event) {
    event.preventDefault();
    selectedFile = event.dataTransfer.files[0];  
    fileInput.value=""; 
    fileDrop.textContent = selectedFile.name;
    if (event.dataTransfer.files.length > 0) {
        if(resumptionFlag){
            if(selectedFile.name!==fileToResume)
            {
                selectedFile=null;
                selectFileButton.disabled = true;                
                nameError.style.display="block";
                nameError.textContent="The file chosen has a name different than the upload being resumed";
            }
            else{
                nameError.style.display="none";
                nameError.textContent="";
                selectFileButton.disabled = false;
                
            }
        }
        else{
            nameError.style.display="none";
            nameError.textContent="";   
            selectFileButton.disabled = false;            
        }        
    }    
});



selectFileButton.addEventListener('click', function (e) {
    $('#fileSelectionModal').modal('hide'); 
    file = selectedFile;
     //file = selectedFile;//e.target.files[0]
    selectedFileLabel.value=selectedFile.name;
    statusMessage.textContent = "Ready to upload...";
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
        fileError.textContent = `File type not allowed. Only ${allowedExtensions.join(', ')} files are accepted.`;
        statusMessage.textContent = "";
        w2ui.currentuploadtoolbar.disable('startUpload');
        selectedFile=null;
        selectedFileLabel="";
    } 
    else {
        fetch(fileExistCheckEndpoint+"?filename="+encodeURIComponent(selectedFile.name)+"&uploader="+encodeURIComponent(cpfNoInput.value))
        .then(response => response.json())
        .then(resp => {
            //console.log(resp);
            switch(resp.status)
            {
                case 0: setupUpload(file);
                    break;
                case 1: fileError.textContent = `File "${selectedFile.name}" already exists in the server.`;
                    statusMessage.textContent = "";
                    w2ui.currentuploadtoolbar.disable('startUpload');
                    selectedFile=null;
                    selectedFileLabel.value="";
                    resetProgress();
                    break;
                case 2: fileError.innerHTML = `File "${selectedFile.name}" is currently being uploaded by another user.`;
                    statusMessage.textContent = "";
                    w2ui.currentuploadtoolbar.disable('startUpload');
                    selectedFile=null;
                    selectedFileLabel.value="";
                    resetProgress();
                    break;  
                case 3: setupUpload(file,resp.data.metadata.filepartSizeInBytes,resp.data.size);
                    break; 
                default : break;   
            }            
             
        });    
    }
})

function setupUpload(file,filepartSizeInBytes=0,fileSizeInBytes=0)
{    
    fileError.textContent = ''; // Clear the error message
    if(filepartSizeInBytes&&fileSizeInBytes)
    {
        var pcCompleted=Math.floor((filepartSizeInBytes)*100/(fileSizeInBytes));
        progressBar.style.width = pcCompleted + '%';
        progressBar.textContent = Math.floor(pcCompleted) + '%';
        progressBar.setAttribute('aria-valuenow', pcCompleted);
        statusMessage.textContent = "Ready to upload. Shall resume from previously attempted upload.";
    }
    else
    {
        resetProgress();
        statusMessage.textContent = "Ready to upload...";
    }        
    // Create a new tus upload
    upload = new tus.Upload(file, {
        // Endpoint is the upload creation URL from your tus server
        endpoint: uploadEndpoint,
        // Retry delays will enable tus-js-client to automatically retry on errors
        retryDelays: [0, 3000, 5000, 10000, 20000],
        // Attach additional meta data about the file for the server
        metadata: {
            filename: file.name,
            filetype: file.type,
            uploaded_by:cpfNoInput.value,            
        },
        // Callback for errors which cannot be fixed using retries
        onError: function (error) {
            console.error("Upload failed:", error);
            //alert("Upload failed.");
            statusMessage.textContent = "Upload Failed";
        },
        // Callback for reporting upload progress
        onProgress: function (bytesUploaded, bytesTotal) {
            var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
            console.log(bytesUploaded, bytesTotal, percentage + '%')

            progressBar.style.width = percentage + '%';
            progressBar.textContent = Math.floor(percentage) + '%';
            progressBar.setAttribute('aria-valuenow', percentage);

            // Update status and bytes transferred
            statusMessage.textContent = "Upload in Progress";
            bytesTransferred.textContent = `${formatBytes(bytesUploaded)}  out of ${formatBytes(bytesTotal)}  transferred`;
        },
        // Callback for once the upload is completed
        onSuccess: function () {

            progressBar.style.width = '100%';
            progressBar.textContent = '100 %';
            progressBar.setAttribute('aria-valuenow', '100');
            console.log('Download %s from %s', upload.file.name, upload.url)
            //alert("Upload completed successfully!");
            statusMessage.textContent = "File "+file.name+" has been uploaded successfully";
            
            //resetProgress();
            //fetch(renamePostUploadEndpoint);  
            uploadFileId=(upload.url).substring(((upload.url).lastIndexOf('/'))+1);
            fetch(renamePostUploadEndpoint+"?fileid="+uploadFileId)
                .then(response => response.json())
                .then(data => {listCompletedFiles();});
            clearFileInput();
        },
    })
    w2ui.currentuploadtoolbar.enable('startUpload');
        
}


/*// Check if there are any previous uploads to continue.
    upload.findPreviousUploads().then(function (previousUploads) {
        // Found previous uploads so we select the first one.
        if (previousUploads.length) {
            upload.resumeFromPreviousUpload(previousUploads[0])
        }

        // Start the upload
        upload.start()
    })*/

      

function startOrResumeUpload(upload) {
    // Check if there are any previous uploads to continue.
    upload.findPreviousUploads().then(function (previousUploads) {
        // Found previous uploads so we select the first one.
        if (previousUploads.length) {
            upload.resumeFromPreviousUpload(previousUploads[0])

            uploadFileId=(upload.url).substring(((upload.url).lastIndexOf('/'))+1);
            listFiles();

        }

        // Start the upload
        upload.start()
    })
}

function resetProgress() {
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
    progressBar.setAttribute('aria-valuenow', 0);
    bytesTransferred.textContent = '';
}

// Add listeners for the pause and unpause button

/*startButton.addEventListener("click", function() {
    if (file) {
        updateButtonState('uploading');
       
        startOrResumeUpload(upload);
        

    } else {
        alert("Please select a file first.");
    }

})


pauseButton.addEventListener("click", function() {
    if (upload) {
        //upload.pause();
       
        updateButtonState('paused');
        uploadFileId="";
        //listFiles();
        upload.abort();
        statusMessage.textContent = "Upload Paused";
      
    }
})

resumeButton.addEventListener("click", function() {
    if (upload) {
        updateButtonState('uploading');
        uploadFileId=(upload.url).substring(((upload.url).lastIndexOf('/'))+1);
        //listFiles();
        startOrResumeUpload(upload);
        statusMessage.textContent = "Resuming Upload...";
       
    }
})



stopButton.addEventListener("click", function() {

    if(upload)
    {
        $('#stopConfirmationModal').modal('show');
    }    
    
})*/

confirmStopButton.addEventListener("click", function() {

    $('#stopConfirmationModal').modal('hide');
    upload.abort();
    statusMessage.textContent = "Upload Cancelled";
    resetProgress();
    selectedFile = null;
    selectedFileLabel.value="";
    selectFile.disabled=true;
    fileDrop.textContent = "Drag and drop file here";
    deleteFile(upload.url);
    updateButtonState('stopped');
    clearFileInput();
    
})
    



window.addEventListener('load', clearFileInput);
updateButtonState('idle');
//listFiles();

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function clearFileInput() {
    fileInput.value = '';  // Clears the file input field
    file = null;  // Reset the file variable
    updateButtonState('idle');
}

// Function to delete an uploaded file using fetch
function deleteFile(uploadUrl) {
    //console.log(fileName);
    fetch(uploadUrl, {
        method: 'DELETE',
        headers: {
            'Tus-Resumable': '1.0.0' // Tus protocol version
        }
    })
        .then((response) => {
            if (response.ok) {
                console.log('File deleted successfully');                 
                if(upload)
                {
                    const currUploadFileId=(upload.url).substring(((upload.url).lastIndexOf('/'))+1);// File being uploaded currently
                    const fileToDeleteId=uploadUrl.substring(((uploadUrl).lastIndexOf('/'))+1);
                    if(currUploadFileId==fileToDeleteId)
                    {
                        clearFileInput();
                        statusMessage.textContent = "Upload Cancelled";
                        selectedFile = null;
                        selectedFileLabel.value="";
                        selectFile.disabled=true;
                        fileDrop.textContent = "Drag and drop file here";
                        progressBar.style.width = '0%';
                        progressBar.textContent = '0%';
                        progressBar.setAttribute('aria-valuenow', 0);
                        bytesTransferred.textContent = '';
                    }
                    
                }
                
                
            } else {
                console.error('Failed to delete file', response.status, response.statusText);
            }
            listFiles();    
        })
        .catch((error) => {
            console.error('Error deleting file:', error);
        });
}

function updateButtonState(status) {
    
    listFiles();
    //
    switch (status) {
        case 'idle': // No upload in progress
            w2ui.currentuploadtoolbar.disable('startUpload','pauseUpload','resumeUpload','stopUpload');
            break;
        case 'uploading': // Upload in progress
            w2ui.currentuploadtoolbar.disable('startUpload','resumeUpload');
            w2ui.currentuploadtoolbar.enable('pauseUpload','stopUpload');           
            break;
        case 'paused': // Upload paused
            w2ui.currentuploadtoolbar.disable('pauseUpload');
            w2ui.currentuploadtoolbar.enable('startUpload','resumeUpload','stopUpload');            
            break;
        case 'completed': // Upload completed
            w2ui.currentuploadtoolbar.disable('pauseUpload','resumeUpload','stopUpload');
            w2ui.currentuploadtoolbar.enable('startUpload',);
            break;
        case 'stopped': // Upload stopped
            w2ui.currentuploadtoolbar.disable('pauseUpload','resumeUpload','stopUpload');
            w2ui.currentuploadtoolbar.enable('startUpload',);            
            break;
    }
}

function listFiles(){    
    fetch(fileListingEndpoint)
        .then(response => response.json())
        .then(data => {
            //const tableBody = document.getElementById('uploaded-files-list');

            //tableBody.innerHTML = '';  // Clear the list            
            
            // Loop through the files and create table rows for each
            var records=[];
            w2ui.pendinguploadsgrid.records=records;
            w2ui.pendinguploadsgrid.refresh();            
                
            data.forEach(file => {                    
                const uploadStatus = file.fileSizeInBytes===file.metadata.size ? 'Complete' : 'Interrupted';                
                if(uploadStatus=="Interrupted"&&uploadFileId!=file.metadata.id)
                {                        
                    var pcCompleted=Math.floor((file.fileSizeInBytes)*100/(file.metadata.size));
                    //var creationdate= new Date(file.metadata.creation_date);                       
                    //var creationDateStr=creationdate.toLocaleDateString()+ " "+creationdate.toLocaleTimeString();
                    var updationDate= new Date(file.fileUpdatedAt);   
                    var updateDateStr=updationDate.toLocaleDateString()+ " "+updationDate.toLocaleTimeString();

                    var progressBarColor= file.metadata.metadata.uploaded_by===cpfNoInput.value?'warning':'secondary';
                    var progressHTML=
                        '<div style="display:flex"><div style="flex: 25%;">'
                        +pcCompleted+'%'+
                        '</div><div class="progress mt-0" style="flex: 75%;"><div class="progress-bar progress-bar-striped progress-bar-'+progressBarColor+'" style="width: '+pcCompleted+'%" aria-valuenow="'
                        +pcCompleted+
                        '" aria-valuemin="0" aria-valuemax="100"></div></div></div>';
                    
                    var rowColor= file.metadata.metadata.uploaded_by===cpfNoInput.value?'#c24e27':'';
                    records.push({recid:file.metadata.id,
                        filename:file.metadata.metadata.filename,
                        size:formatBytes(file.metadata.size),
                        uploaded_by:file.metadata.metadata.uploaded_by,
                        uploaded_at:updateDateStr|| 'Unknown',
                        progress:progressHTML,
                        w2ui:{"style": `color: ${rowColor}`}
                    });
                }                   
            
            });               
            w2ui.pendinguploadsgrid.records=records;
            w2ui.pendinguploadsgrid.refresh();
            w2ui.pendinguploadsgrid.toolbar.disable('resumeUploadFromList','deletePendingUpload');
            w2ui.pendinguploadsgrid.selectNone();
            
                
        
        //document.querySelectorAll('.delete-icon').forEach(icon => {
        //    icon.addEventListener('click', deleteOldFile);
       // });
       // document.querySelectorAll('.resume-icon').forEach(icon => {
       //     icon.addEventListener('click', resumeFromList);
       // });
    });

    
}

function listCompletedFiles(){
    fetch(fileExplorerEndpoint)
        .then(response => response.json())
        .then(data => {
            //console.log(data);
            //console.log(grid);           
            var records=[];
            w2ui.grid.records=records;
            w2ui.grid.refresh();    
            data.forEach(file => {
                
                //console.log(file.fileSizeInBytes)
                //const uploadStatus = file.fileSizeInBytes===file.metadata.size ? 'Complete' : 'Interrupted';
                var creationdate= new Date(file.creation_date);
                var creationDateStr=creationdate.toLocaleDateString()+ " "+creationdate.toLocaleTimeString();
                var rowColor= file.metadata.uploaded_by===cpfNoInput.value?'#214082':'';
                records.push({recid:file.id,
                    filename:file.metadata.filename,
                    size:formatBytes(file.size),
                    uploaded_by:file.metadata.uploaded_by,
                    uploaded_at:creationDateStr,
                    w2ui:{"style": `color: ${rowColor}`}
                });
                                 
           
            });
            //console.log( w2ui.grid.name);
            //w2ui.grid.add(records);
            //w2ui.grid.refresh();
            //console.log( w2ui.grid.records);
            w2ui.grid.records=records;
            w2ui.grid.refresh();
            w2ui.grid.toolbar.disable('renameFile','deleteFile');
            w2ui.grid.selectNone();
        });
        
}


function resumeFromList(fileList)
{    
    if(fileList.length==1)
    {
        fileInput.value="";
       
        const theFile = fileList[0];
        const theFileRecord = w2ui.pendinguploadsgrid.get(theFile)
        const uploader = theFileRecord.uploaded_by;
        if(uploader!==cpfNoInput.value)
        {
            opNotAllowedLabel.textContent="Cannot resume pending upload";
            opNotAllowedText.textContent=`The upload for file ${theFileRecord.filename} has been initiated by another user '${theFileRecord.uploaded_by}'.
                The upload can be resumed by that user only.
                `;           
            resumptionFlag=false;
            fileToResume="";
            resumptionInfo.style.display="none";
            $('#opNotAllowedModal').modal('show');
        }
        else
        {
            fileDrop.textContent = "Drag and drop file here";
            resumptionFileLabel.textContent=theFileRecord.filename
            resumptionInfo.style.display="block";
            nameError.style.display="none";
            selectFileButton.disabled=true;
            resumptionFlag=true;
            fileToResume=theFileRecord.filename;
            $('#fileSelectionModal').modal('show');
        }       
    }    
}

function deleteFiles(fileList,filesgrid) {
    
    //const icon = event.currentTarget;
    //const fileToDeleteId = icon.getAttribute('data-file-id');  
    //$('#confirmDeleteButton').attr('delete-file-id',fileToDeleteId);
    numFiles=fileList.length;
    
    numFilesLabel=numFiles>1?"multiple files":"";
    numFilesText=numFiles>1?"these "+numFiles+" files?":"the file <b>'"+filesgrid.get(fileList[0]).filename+"'</b>?";
    
    deleteConfirmationLabel.textContent="Confirm "+numFilesLabel+" deletion";
    deleteConfirmationText.innerHTML="Are you sure you want to delete "+numFilesText;
    filegridName=filesgrid.name;
    switch(filegridName)
    {
        case 'grid':
            fileOrigNameList=[];
            fileList.forEach(file=>{fileOrigNameList.push(w2ui.grid.get(file).filename)});
            sessionStorage.setItem('filesToDelete', JSON.stringify(fileOrigNameList));            
            sessionStorage.removeItem("pendingFilesToDelete");
            break;
        case 'pendinguploadsgrid':sessionStorage.setItem('pendingFilesToDelete', JSON.stringify(fileList));
            sessionStorage.removeItem("filesToDelete");
            break;
        default: break;
    }
    
    //console.log(fileList);
    confirmDeleteButton['file-grid-name']=filegridName;
    $('#deleteConfirmationModal').modal('show');
    
}


function renameFile(fileList) {
    numFiles=fileList.length;
    if(numFiles==1)
    {
        const oldFileName = w2ui.grid.get(fileList[0]).filename; 
        
        if (!oldFileName) {
            alert('No file selected for renaming.');
            return;
        }
        // Set the old filename as the input value (not placeholder)
        const input = document.getElementById('newFileNameInput');
        input.value = oldFileName;
        sessionStorage.setItem('fileToRename',oldFileName);

        document.getElementById('renameError').textContent = '';

        const extensionIndex = oldFileName.lastIndexOf('.');
        if (extensionIndex > 0) {
            input.setSelectionRange(0, extensionIndex);
        } else {
            input.select();
        }


        const modal = new bootstrap.Modal(document.getElementById('renameModal'));
        modal.show();
        setTimeout(() => input.focus(), 500); // Focus after modal animation
    }
   
}

renameButton.addEventListener("click", async function() {

    
    const oldFileName = sessionStorage.getItem('fileToRename');
    const newFileName = document.getElementById('newFileNameInput').value.trim();
    const errorElement = document.getElementById('renameError');
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  
    if (!newFileName) {
      errorElement.textContent = 'Please enter a new file name.';
      errorElement.style.display = 'block';
      return;
    }
  
    if (oldFileName === newFileName) {
      errorElement.textContent = 'New filename is the same as the old filename.';
      errorElement.style.display = 'block';
      return;
    }
  
    const validExtensions = ['.segy', '.sgy'];
    const fileExtension = newFileName.substring(newFileName.lastIndexOf('.'));
  
    if (!validExtensions.includes(fileExtension.toLowerCase())) {
      errorElement.textContent = 'Only .segy and .sgy file extensions are allowed.';
      errorElement.style.display = 'block';
      return;
    }
    $('#renameModal').modal('hide');
    try {
      const response = await fetch(renameFileEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldFileName, newFileName, user:cpfNoInput.value})
      });
  
      const result = await response.json();
      displayRenameResult(result);
    } catch (error) {
      console.error('Rename error:', error);
      displayRenameResult({ filename:oldFileName,status: 'Failure', remarks: 'Server error occurred.' });
    }
    listCompletedFiles();
});


/*confirmDeleteButton.addEventListener("click", function() {
    $('#deleteConfirmationModal').modal('hide');
    fileList= JSON.parse(sessionStorage.getItem('pendingFilesToDelete'));
    ///console.log(fileList);    
    w2ui.pendinguploadsgrid.lock();
    fileList.forEach((file)=>{
        deleteFile(uploadEndpoint+"/"+encodeURIComponent(file));
        console.log("Deleted file "+file);
    })
    sessionStorage.removeItem("pendingFilesToDelete");   
    w2ui.pendinguploadsgrid.selectNone();
    listFiles();
    
})*/

confirmDeleteButton.addEventListener("click", async function() {
    $('#deleteConfirmationModal').modal('hide');
    
    fileGridName=confirmDeleteButton['file-grid-name'];
    filegrid=null;
    
   
    switch(fileGridName)
    {
        case 'grid': deleteURL=deleteFilessEndpoint;
            fileList= JSON.parse(sessionStorage.getItem('filesToDelete'));
            
            break;          
        case 'pendinguploadsgrid': deleteURL=deletePendingUploadsEndpoint;
            fileList= JSON.parse(sessionStorage.getItem('pendingFilesToDelete'));
            
            break;
        default:deleteURL="";break;
    }
    try {
        const response = await fetch(deleteURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ files: fileList,user:cpfNoInput.value })
        });
    
        const result = await response.json();        
        displayDeletionResults(result,fileGridName);
        if(upload)
        {            
            var fileResult;
            if(fileGridName==='grid')
            {
                const currUploadFileName=upload.file.name; // File just uploaded
                //console.log(currUploadFileName);
                fileResult = result.find(entry => entry.file === currUploadFileName);
            }
            else if(fileGridName==='pendinguploadsgrid')
            {
                const currUploadFileId=(upload.url).substring(((upload.url).lastIndexOf('/'))+1);// File being uploaded currently
                fileResult = result.find(entry => entry.file === currUploadFileId);
            }                
            
            if(fileResult&&fileResult.status === 'Success')
            {
                clearFileInput();
                statusMessage.textContent = fileGridName==='pendinguploadsgrid'?"Upload Cancelled":"";
                selectedFile = null;
                selectedFileLabel.value="";
                selectFileButton.disabled=true;
                fileDrop.textContent = "Drag and drop file here";
                progressBar.style.width = '0%';
                progressBar.textContent = '0%';
                progressBar.setAttribute('aria-valuenow', 0);
                bytesTransferred.textContent = '';
            }
            
        }

      } catch (error) {
        console.error('Error deleting files:', error);
        alert('An error occurred while deleting files.');
      }      
    w2ui.grid.searchClose();  
    w2ui.pendinguploadsgrid.searchClose();  
    listCompletedFiles();
    listFiles();
    sessionStorage.removeItem("pendingFilesToDelete");   
    sessionStorage.removeItem("filesToDelete"); 
    w2ui.grid.selectNone();  
    w2ui.pendinguploadsgrid.selectNone();    
    confirmDeleteButton['file-grid-name']="";
    
})

// Function to display the deletion results in a Bootstrap modal
function displayDeletionResults(results,fileGridName) {
    const modalBody = document.getElementById('deletionResultsBody');
    modalBody.innerHTML = '';   
    results.forEach(({ file, status, remarks }) => {
      const icon = status === 'Success' ? 'check-circle' : 'x-circle';
      const rowClass = status === 'Success' ? 'success' : 'danger';
      var fileName="";
      switch(fileGridName)
        {
            case 'grid':fileName=file;
                break;
            case 'pendinguploadsgrid':fileName=w2ui.pendinguploadsgrid.get(file).filename;
                break;
            default:break;
        }  
      const row = `
        <tr>
          <td class="${rowClass}"><i class="bi bi-${icon}"></i></td>
          <td>${fileName}</td>
          <td>${status}</td>
          <td>${remarks}</td>
        </tr>
      `;
  
      modalBody.insertAdjacentHTML('beforeend', row);
    });
  
    new bootstrap.Modal(document.getElementById('deletionResultsModal')).show();
}

// Function to display rename result in a Bootstrap modal
function displayRenameResult({ filename, status, remarks }) {
    const icon = status === 'Success' ? 'check-circle' : 'x-circle';
    const modalBody = document.getElementById('renameResultBody');
  
    const fileNameLabel=status === 'Success'?"":`<p><strong>Filename:</strong> ${filename}</p>`;
    modalBody.innerHTML = `
    <div class="alert ${status === 'Success' ? 'alert-success' : 'alert-danger'}" role="alert">
      ${fileNameLabel}
      <p><i class="bi bi-${icon}"></i> <strong>${status}:</strong> ${remarks}</p>
    </div>
    `;
  
    new bootstrap.Modal(document.getElementById('renameResultModal')).show();
}
    

[...document.body.children].forEach(el => {
    if (el.scrollWidth > window.innerWidth) {
      console.log('Overflowing element:', el);
    }
  });
  
