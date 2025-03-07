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
//const currentUploadFilename= document.getElementById('currentUploadFilename');
const progressBar = document.getElementById('uploadProgress');
const bytesTransferred = document.getElementById('bytesTransferred');
const selectFileButton=document.getElementById('selectFile');
const selectedFileLabel=document.getElementById('fileError');
const fileDrop=document.getElementById('fileDrop');

const showQueueButton=document.getElementById('showQueue');
const queueBadge=document.getElementById('queueBadge');

const cpfNoInput=document.getElementById('cpfNo');

const stopModalCancelButton=document.getElementById('stopModalCancel');
const stopModalCancelX=document.getElementById('stopModalCancelX');

const deleteConfirmationLabel=document.getElementById('deleteConfirmationLabel');
const deleteConfirmationText=document.getElementById('deleteConfirmationText');

const opNotAllowedLabel=document.getElementById('opNotAllowedLabel');
const opNotAllowedText=document.getElementById('opNotAllowedText');



const fileResumptionInput=document.getElementById('fileResumptionInput');
const fileResumptionDrop=document.getElementById('fileResumptionDrop');
const resumptionFileLabel=document.getElementById('resumptionFileLabel');
const selectResumptionFileButton=document.getElementById('selectResumptionFile');
const resumptionFileError=document.getElementById('resumptionFileError');

const renameButton = document.querySelector("#renameFile");


const fileSelectionResult=document.querySelector("#fileSelectionResult");


fileSelectionResult.innerHTML="";

var currentUpload=null;
//var resumptionFlag=false;
var fileToResume="";
//resumptionInfo.style.display="none";


var upload;
var lastUpload; // This variable to be used in case of deletion of a file which was just uploaded
//var uploadFileId;
var file;
const allowedExtensions = ['.segy', '.sgy','.SEGY', '.SGY'];

/****************TO BE UNCOMMENTED IN PRODUCTION */
//fileInput.accept=allowedExtensions.toString();

const server_addr='localhost:3000';
const uploadEndpoint=`http://${server_addr}/files/`;
const fileListingEndpoint=`http://${server_addr}/pendinguploads`;
const fileExplorerEndpoint=`http://${server_addr}/segyfilelist`;
const fileExistCheckEndpoint=`http://${server_addr}/checkfileexists`;
const filesStatusCheckEndpoint=`http://${server_addr}/checkfilesstatus`;
const deletePendingUploadsEndpoint=`http://${server_addr}/deletePendingUploads`;
const deleteFilessEndpoint=`http://${server_addr}/deleteFiles`;
const renamePostUploadEndpoint=`http://${server_addr}/postUploadRename`;
const renameFileEndpoint=`http://${server_addr}/renameFile`;
var selectedFile = null;
var selectedFiles=[];
let selectedFileNames = [];
fileInput.value="";
selectedFileLabel.value="";
fileDrop.textContent = "Drag and drop files here";
//selectFileButton.disabled=true;
//resumptionFileError.style.display="none";
//resumptionFileError.textContent="";
updateButtonState('idle');

listCompletedFiles();

let fileQueue = [];
var validFiles = [];

cpfNoInput.value='ep125363';



chooseButton.addEventListener("click", function() {  
    fileInput.value="";    
    fileDrop.style.textAlign="center";
    fileDrop.textContent = "Drag and drop files here";
    selectFileButton.disabled=true;
    $('#fileSelectionModal').modal('show');
})

fileInput.addEventListener('change', function(event) {  

    selectedFiles=  Array.from(event.target.files);
    fileDrop.style.textAlign="center";
    fileDrop.textContent = "Drag and drop files here";
    selectFileButton.disabled = false;  

});

fileResumptionInput.addEventListener('change', function(event) {
    selectedFile = event.target.files[0];
    if(selectedFile.name!==fileToResume)
    {
        selectedFile=null;
        selectResumptionFileButton.disabled = true;            
        resumptionFileError.style.display="block";
        resumptionFileError.textContent="The file chosen has a name different than the upload being resumed";
    }
    else{
        resumptionFileError.style.display="none";
        resumptionFileError.textContent="";
        selectResumptionFileButton.disabled = false;            
    }
    
});






fileDrop.addEventListener('drop', function(event) {
    event.preventDefault();    
    selectedFiles=selectedFiles.concat(Array.from(event.dataTransfer.files));
    fileInput.value=""; 
    selectFileButton.disabled = false;  
    let ddTextContent="";
    selectedFiles.forEach(file=>{ddTextContent=ddTextContent+file.name+",<br>"});
    fileDrop.style.textAlign="left";
    fileDrop.innerHTML = ddTextContent;
});

fileResumptionDrop.addEventListener('drop', function(event) {
    event.preventDefault();    
    selectedFile=event.dataTransfer.files[0];
    fileResumptionInput.value=""; 
    selectResumptionFileButton.disabled = false;  
    fileResumptionDrop.style.textAlign="left";
    fileResumptionDrop.innerHTML = selectedFile.name;
    if(selectedFile.name!==fileToResume)
    {
        selectedFile=null;
        selectResumptionFileButton.disabled = true;                
        resumptionFileError.style.display="block";
        resumptionFileError.textContent="The file chosen has a name different than the upload being resumed";
    }
    else{
        resumptionFileError.style.display="none";
        resumptionFileError.textContent="";
        selectResumptionFileButton.disabled = false;        
    }
});



selectFileButton.addEventListener('click', function (e) {
    $('#fileSelectionModal').modal('hide');
    selectedFileNames = selectedFiles.map(file => file.name);
    if(selectedFileNames.length){
        fetch(`${filesStatusCheckEndpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files:selectedFileNames,user:cpfNoInput.value })
        })
        .then(response => response.json())
        .then(data => {            
            populateFileSelectionResults(data); 
        })
        .catch(error => console.error('Error checking file status:', error));
    }
})

selectResumptionFileButton.addEventListener('click', function (e) {
    $('#fileResumptionModal').modal('hide');    
    if(selectedFile){
        selectedFiles.push(selectedFile);
        fetch(`${filesStatusCheckEndpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files:[selectedFile.name],user:cpfNoInput.value })
        })
        .then(response => response.json())
        .then(data => {            
            populateFileSelectionResults(data); 
        })
        .catch(error => console.error('Error checking file status:', error));
    }

    /*if(selectedFileNames.length==1) selectedFileLabel.value=selectedFileNames[0];
    else selectedFileLabel.value=`${selectedFileNames[0]} and ${(selectedFileNames.length-1)} more files se*lected.`;
    fileError.innerHTML = `<a href="#" data-toggle="modal" data-target="#fileStatusModal">View</a>`;*/

    //file = selectedFile; 

    /*fetch(fileExistCheckEndpoint+"?filename="+encodeURIComponent(selectedFile.name)+"&uploader="+encodeURIComponent(cpfNoInput.value))
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
            
    });   */ 
   
      
})


function populateFileSelectionResults(data)
{
    const tableBody = document.getElementById("fileStatusTableBody");
    tableBody.innerHTML = "";
    let validCtr=0;
    let queueFlag=0;//This flag will be pplicable to cases where only one file is selected by user
    data.forEach(fileResponse => {
        const row = document.createElement("tr");
        let queueMsg="";
        let textColor="";
        let queIcon="";  
        tableBody.appendChild(row);                
        if (fileResponse.status === 0||fileResponse.status === 1) {
            let validFile=selectedFiles.find(selectedFile=>selectedFile.name===fileResponse.fileName);
            if(validFile){                
                let percentage =0;
                let bytesTotal=0;
                if(fileResponse.data.metadata){
                    let bytesUploaded=fileResponse.data.metadata.filepartSizeInBytes;
                    bytesTotal=fileResponse.data.size;
                    percentage=((bytesUploaded / bytesTotal) * 100).toFixed(0);           
                }
                let fileInQueue=fileQueue.find(entry => entry.file.name === validFile.name);
                if(!fileInQueue){
                    if(fileResponse.status === 1&&bytesTotal!=validFile.size){
                        queueMsg="Not added to Queue";textColor="text-danger";queIcon="x";
                        fileResponse.message=`File size mismatch with earlier upload attempt. Earlier Size: ${formatBytes(bytesTotal)} , This Size:${formatBytes(validFile.size)}`;
                        fileResponse.status=6;
                    }
                    else{
                        validFiles.push({file:validFile,response:fileResponse});
                        fileQueue.push({file:validFile,response:fileResponse,queueStatus:{statusCode:0,progressPc:percentage}});
                        queueMsg="Added to queue.";textColor="text-success";queIcon="check";
                        validCtr++;
                    }                    
                }
                else{
                    if(fileInQueue.queueStatus.statusCode===3){// Was previously cancelled. Now user trying to add again to queue
                        let sliceIndex=fileQueue.indexOf(fileInQueue);
                        fileQueue.splice(sliceIndex,1);
                        validFiles.push({file:validFile,response:fileResponse});
                        fileQueue.push({file:validFile,response:fileResponse,queueStatus:{statusCode:0,progressPc:percentage}});
                        queueMsg="Added to queue again after previously cancelled.";textColor="text-success";queIcon="check";
                        validCtr++;
                    }
                    queueFlag=1;
                    queueMsg="Already added in queue.";textColor="text-info";queIcon="check";
                }                
            }
        }
        else{
            queueMsg="Not added to Queue";textColor="text-danger";queIcon="x";
        }
        row.innerHTML = `
            <td>${fileResponse.fileName}</td>
            <td class="${textColor}"><i class="bi bi-${queIcon}-circle"></i> ${queueMsg}</td>
            <td>${fileResponse.message}</td>
        `;
    });  
    
    let respCodes=data.map(fileResponse => fileResponse.status);
    if(data.length==1){
        let status=data[0].status;
        if (status === 0||status === 1) {             
            if(!queueFlag){
                fileSelectionResult.className="text-success";
                fileSelectionResult.innerHTML=`File "${data[0].fileName}" added to Queue`; 
                //This will be applicable in case where a file  is being added to queue while an upload is in progress.
                //In that case progress of current upload should not be reset.   
                if(fileQueue.length===1){ 
                    resetProgress();
                    w2ui.currentuploadtoolbar.set('currentFilelabel',{value:data[0].fileName});
                }    
                statusMessage.textContent = "Ready to upload...";
            }
            else{// File added to end of queue
                fileSelectionResult.className="text-info";
                fileSelectionResult.innerHTML=`File "${data[0].fileName}" already present in queue. Will be resumed.`;
                statusMessage.textContent = "Ready to upload...";   
            }
            
        }    
        else{
            switch(status)
            {            
                case 2:fileSelectionResult.className="text-danger";
                    fileSelectionResult.innerHTML=`${data[0].fileName} : ${data[0].message}`;
                    resetProgress();
                    statusMessage.textContent = "";                
                    break;
                case 3:fileSelectionResult.className="text-danger";
                    fileSelectionResult.innerHTML=`${data[0].fileName} : ${data[0].message}`;
                    resetProgress();
                    statusMessage.textContent = "";
                    break;           
                case 4:
                    fileSelectionResult.className="text-danger";
                    fileSelectionResult.innerHTML=`${data[0].fileName} : ${data[0].message}`;
                    resetProgress();
                    statusMessage.textContent = "";
                    break;
                case 5:
                    fileSelectionResult.className="text-danger";
                    fileSelectionResult.innerHTML=`${data[0].fileName} : ${data[0].message}`;
                    resetProgress();
                    statusMessage.textContent = "";
                    break;
                case 6:
                    fileSelectionResult.className="text-danger";
                    fileSelectionResult.innerHTML=`${data[0].fileName} : ${data[0].message}`;
                    resetProgress();
                    statusMessage.textContent = "";
                    break;
                default:break;
            }   
        }
        
    }
    else{
        
        let infoLinkHTML=`<a href="#" data-bs-toggle="modal"  data-bs-target="#fileStatusModal" >${validCtr} of ${selectedFiles.length} files </a>`
        if(respCodes.includes(2)||respCodes.includes(3)||respCodes.includes(4)||respCodes.includes(5)||respCodes.includes(6)){
            fileSelectionResult.className="text-warning";
            fileSelectionResult.innerHTML=`There were errors in some of the files you selected. ${infoLinkHTML} were added to queue` ;
            
            statusMessage.textContent = "Ready to upload...";
        }
        else if(respCodes.includes(1)){
            fileSelectionResult.className="text-info";
            fileSelectionResult.innerHTML=`There is information regarding some of the files you selected. ${infoLinkHTML} were added to queue` ;
            
            statusMessage.textContent = "Ready to upload...";
        }
        else if(respCodes.includes(0)){
            fileSelectionResult.className="text-success";
            fileSelectionResult.innerHTML=`${data[0].fileName} and  ${(selectedFiles.length)-1} other files were added to the queue` ;
            
            statusMessage.textContent = "Ready to upload...";
        }  
        else{
            fileSelectionResult.className="text-danger";
            fileSelectionResult.innerHTML=`There are errors in all of the files you selected. ${infoLinkHTML} were added to queue` ;
           
            statusMessage.textContent = "";
        }   
           
    }
    
    if(respCodes.includes(1)||respCodes.includes(0)){
        renderQueue(fileQueue);       
        
        //The following code prevents execution of setupUpload on subsequent file selections
        if(!upload){
            setupUpload();
        }
        else{ // upload already set up
            var queueCurrItem = fileQueue.find(entry => entry.file.name === upload.file.name);
            queueCurrItem.queueStatus.statusCode=1;    
            let fileNum=(fileQueue.indexOf(queueCurrItem))+1;
            let currFileLabel=`File ${fileNum} of ${fileQueue.length} : ${upload.file.name}`;
            w2ui.currentuploadtoolbar.set('currentFilelabel',{value:currFileLabel});
            //w2ui.currentuploadtoolbar.enable('startUpload');
            
        }
        

        //let currentUpload=validFiles[0].file;
        //let currentStatus=validFiles[0].response.status;
        //let currentData=validFiles[0].response.data;
        //console.log(validFiles[0].response);
        //currentUploadFilename.textContent = validFiles[0].response.fileName;
        //if(currentStatus===1){
       //     setupUpload(currentUpload,currentData.metadata.filepartSizeInBytes,currentData.size);
          //  let bytesUploaded=currentData.metadata.filepartSizeInBytes;
          //  let bytesTotal=currentData.size;
           // var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);            

           // progressBar.style.width = percentage + '%';
           // progressBar.textContent = Math.floor(percentage) + '%';
           // progressBar.setAttribute('aria-valuenow', percentage);
            
            //currentUploadFilename.textContent = validFiles[0].response.fileName;
            // Update status and bytes transferred
           // bytesTransferred.textContent = `${formatBytes(bytesUploaded)}  out of ${formatBytes(bytesTotal)}  transferred`;

            //progressBar.classList.add('progress-bar-warning')
           // progressBar.classList.remove('bg-success')
      //  }
      //  else{
           
       //     setupUpload(currentUpload);
           // progressBar.classList.add('progress-bar-warning')
           // progressBar.classList.remove('bg-success')
       // }
    }
    else{
        fileSelectionResult.className="";
        statusMessage.textContent = "";
        w2ui.currentuploadtoolbar.set('currentFilelabel',{value:""});
        w2ui.currentuploadtoolbar.disable('startUpload');
    }
    //console.log(validFiles); 
    //resetProgress();   
    listFiles();
    $('#fileStatusModal').modal('show');
   

    //updateFileQueue(validFiles);
}


showQueueButton.addEventListener("click", function() {      
    $('#queueModal').modal('show');
})

function renderQueue(fileQueue) {
    const queueList = document.getElementById("queueListTableBody");
    queueList.innerHTML = "";    
    fileQueue.forEach((queuedfile, index) => {
        const row = document.createElement("tr");
        /*let queueMsg="";
        let textColor="";
        let queIcon="";
        switch(fileResponse.status)
        {
            case 0:queueMsg="Added to queue.";textColor="text-success";queIcon="check";break;
            case 1:queueMsg="Added to queue.";textColor="text-info";queIcon="check";break;
            default:queueMsg="Not added to Queue";textColor="text-danger";queIcon="x";
        }*/
        
        /*var percentage =0;
        if(queuedfile.response.data.metadata)
            {
                let bytesUploaded=queuedfile.response.data.metadata.filepartSizeInBytes;
                let bytesTotal=queuedfile.response.data.size;
                percentage=((bytesUploaded / bytesTotal) * 100).toFixed(2);           
            }*/

        

        
        let uploadStatus="Waiting...";   
        var percentage=queuedfile.queueStatus.progressPc;
        
        switch(queuedfile.queueStatus.statusCode)
        {
            case 0: var progressHTML=
            '<div style="display:flex"><div style="flex: 25%;">'
            +percentage+'%'+
            '</div><div class="progress mt-0" style="flex: 75%;"><div class="progress-bar progress-bar-striped bg-info" style="width: '+percentage+'%" aria-valuenow="'
            +percentage+
            '" aria-valuemin="0" aria-valuemax="100"></div></div></div>';break;

            case 1: var progressHTML=
                '<div style="display:flex"><div style="flex: 25%;"><div id="queueProgressPc">'
            +percentage+'%'+
            '</div></div><div class="progress mt-0" style="flex: 75%;"><div id="queueProgressBar"  class="progress-bar progress-bar-striped bg-success" style="width: '+percentage+'%" aria-valuenow="'
                +percentage+
                '" aria-valuemin="0" aria-valuemax="100"></div></div></div>';
                uploadStatus="Uploading...";break;

            case 2:   var progressHTML=
                `<div style="display:flex"><div style="flex: 25%;">
                100%</div><div class="progress mt-0" style="flex: 75%;">
                <div class="progress-bar" style="width:100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
                </div></div></div>`;
                uploadStatus="Complete";break;

            case 3:   var progressHTML=
            `<div style="display:flex"><div style="flex: 25%;">
            0%</div><div class="progress mt-0" style="flex: 75%;">
            <div class="progress-bar bg-danger" style="width:100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
            </div></div></div>`;           
            uploadStatus="Cancelled";break;
        }

        
        /*progressBar.style.width = percentage + '%';
        progressBar.textContent = Math.floor(percentage) + '%';
        progressBar.setAttribute('aria-valuenow', percentage);*/

        row.innerHTML =`
            <td>${queuedfile.file.name}</td>            
            <td>${formatBytes(queuedfile.file.size)}</td>
            <td><span style="font-style: italic">${uploadStatus}</span></td>
            <td>${progressHTML}</td>
        `;
        row.onclick = () => {           
            
            row.querySelector("input").checked = true
        };
        queueList.appendChild(row);    
    });
    if(fileQueue.length){            
        queueBadge.innerHTML=`${fileQueue.length}`;
        queueBadge.style.display="block";
    }    
    else{        
        queueBadge.innerHTML="0";
        queueBadge.style.display="block";
    }
    
}



//function setupUpload(file,filepartSizeInBytes=0,fileSizeInBytes=0)
function setupUpload()
{    
    
    
    let validFile=validFiles.shift();
    let file=validFile.file
    let fileInfo=validFile.response;
    var filepartSizeInBytes=0;
    var fileSizeInBytes=0;
    if(fileInfo.data.metadata){
        var filepartSizeInBytes=fileInfo.data.metadata.filepartSizeInBytes;
        var fileSizeInBytes=fileInfo.data.size;
    }
    
    fileError.textContent = ''; // Clear the error message
    //currentUploadFilename.textContent = file.name;
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
    let queuedfile=fileQueue.find(entry=>entry.file.name===file.name);
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
            statusMessage.textContent = `Upload Failed : ${file.name}`;
        },
        // Callback for reporting upload progress
        onProgress: function (bytesUploaded, bytesTotal) {
            var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
            var percentageWhole = ((bytesUploaded / bytesTotal) * 100).toFixed(0)
            console.log(bytesUploaded, bytesTotal, percentage + '%')

            progressBar.style.width = percentage + '%';
            progressBar.textContent = Math.floor(percentage) + '%';
            progressBar.setAttribute('aria-valuenow', percentage);
            

            const queueProgressBar=document.getElementById("queueProgressBar");
            if(queueProgressBar)
            {
                queueProgressBar.style.width = percentage + '%';
                queueProgressBar.textContent = Math.floor(percentage) + '%';
                queueProgressBar.setAttribute('aria-valuenow', percentage);
            }
            
            // Update status and bytes transferred
            //currentUploadFilename.textContent = file.name;
            const queueProgressPc=document.getElementById("queueProgressPc");
            if(queueProgressPc)
            {
                if(queuedfile)queuedfile.queueStatus.progressPc=percentageWhole;
                queueProgressPc.textContent=percentageWhole + '%';
            }
           
            
           
            
            statusMessage.textContent = `Uploading...`;
            bytesTransferred.textContent = `${formatBytes(bytesUploaded)}  out of ${formatBytes(bytesTotal)}  transferred`;
        },
        // Callback for once the upload is completed
        onSuccess: function () {

            progressBar.style.width = '100%';
            progressBar.textContent = '100 %';
            progressBar.setAttribute('aria-valuenow', '100');
            //console.log('Download %s from %s', upload.file.name, upload.url)
            //alert("Upload completed successfully!");
            
            
            //resetProgress();
            //fetch(renamePostUploadEndpoint);  
            let uploadFileId=(upload.url).substring(((upload.url).lastIndexOf('/'))+1);
            
            fetch(renamePostUploadEndpoint+"?fileid="+uploadFileId)
                .then(response => response.json())
                .then(data => {listCompletedFiles();});
            //clearFileInput();

            var queueCurrItem = fileQueue.find(entry => entry.file.name === upload.file.name);
            queueCurrItem.queueStatus.statusCode=2;

            if(validFiles.length)
            {
                statusMessage.textContent = "File "+file.name+" has been uploaded successfully. Starting upload of next file...";
                setupUpload();
                startOrResumeUpload(upload)
            }
            else{
                w2ui.currentuploadtoolbar.set('currentFilelabel',{value:''});
                if(fileQueue.length>1){

                    let queueStatuses=fileQueue.map(entry => entry.queueStatus.statusCode);
                    let queueSuccess=queueStatuses.filter((entry)=>{return entry===2});
                    console.log(queueSuccess);
                    if(queueSuccess.length===fileQueue.length)
                        statusMessage.textContent = "All "+fileQueue.length+" files have been uploaded successfully.";
                    else
                        statusMessage.textContent = `${queueSuccess.length} of ${fileQueue.length} files have been uploaded successfully.`;
                }
                else{
                    statusMessage.textContent = "File "+file.name+" has been uploaded successfully.";     
                } 
                              
                renderQueue(fileQueue);  
                fileQueue=[];
                validFiles=[];
                lastUpload=upload;
                upload=null; 
                updateButtonState('idle');

            }
            
        },
    });

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

            //uploadFileId=(upload.url).substring(((upload.url).lastIndexOf('/'))+1);
            listFiles();
            
        }
        

        var queueCurrItem = fileQueue.find(entry => entry.file.name === upload.file.name);
        queueCurrItem.queueStatus.statusCode=1;

        let fileNum=(fileQueue.indexOf(queueCurrItem))+1;
        let currFileLabel=`File ${fileNum} of ${fileQueue.length} : ${upload.file.name}`;
        w2ui.currentuploadtoolbar.set('currentFilelabel',{value:currFileLabel});
        //console.log(queueCurrItem);
        renderQueue(fileQueue);
        // Start the upload
       progressBar.classList.remove('progress-bar-warning')
       progressBar.classList.add('bg-success')
       fileSelectionResult.className="";
       fileSelectionResult.innerHTML="";
       updateButtonState('uploading');
        upload.start();       
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

stopModalCancelX.addEventListener("click", function() {
    if (upload) {
        updateButtonState('uploading');
        
        startOrResumeUpload(upload);
        statusMessage.textContent = "Resuming Upload...";
        progressBar.classList.add("bg-success");
        progressBar.classList.remove("progress-bar-warning");
    }
});

stopModalCancelButton.addEventListener("click", function() {
    if (upload) {
        updateButtonState('uploading');
        
        startOrResumeUpload(upload);
        statusMessage.textContent = "Resuming Upload...";
        progressBar.classList.add("bg-success");
        progressBar.classList.remove("progress-bar-warning");
    
    }
});


confirmStopButton.addEventListener("click", function() {

    $('#stopConfirmationModal').modal('hide');
    upload.abort();
    statusMessage.textContent = "Upload Cancelled";
    resetProgress();    
    deleteFile(upload.url);
    updateButtonState('stopped');
    //clearFileInput();
    
})
    



//window.addEventListener('load', clearFileInput);
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

/*function clearFileInput() {
    fileInput.value = '';  // Clears the file input field
    file = null;  // Reset the file variable
    updateButtonState('idle');
}*/

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
                    /*const currUploadFileId=(upload.url).substring(((upload.url).lastIndexOf('/'))+1);// File being uploaded currently
                    const fileToDeleteId=uploadUrl.substring(((uploadUrl).lastIndexOf('/'))+1);
                    if(currUploadFileId==fileToDeleteId)
                    {
                        //clearFileInput();
                        statusMessage.textContent = "Upload Cancelled";                        
                        resetProgress();
                    }*/
                    var queueCurrItem = fileQueue.find(entry => entry.file.name === upload.file.name);
                    queueCurrItem.queueStatus.statusCode=3; // Status Code 3 means aborted
                    if(validFiles.length)
                    {
                        statusMessage.textContent = "Upload Cancelled for file "+upload.file.name+" has been cancelled. Starting upload of next file...";
                        setupUpload();
                        startOrResumeUpload(upload);
                        
                    }
                    else{
                        let queueStatuses=fileQueue.map(entry => entry.queueStatus.statusCode);
                        let queueSuccess=queueStatuses.filter((entry)=>{return entry===2});                        
                        if(queueSuccess.length===fileQueue.length)
                            statusMessage.textContent = "All "+fileQueue.length+" files have been uploaded successfully.";
                        else
                            statusMessage.textContent = `Upload Cancelled for file "${upload.file.name}". ${queueSuccess.length} of ${fileQueue.length} files have been uploaded successfully.`;

                        //statusMessage.textContent = "Upload Cancelled";                        
                        resetProgress();
                        renderQueue(fileQueue);  
                        fileQueue=[];
                        validFiles=[];
                        lastUpload=upload;                       
                        upload=null; 
                        updateButtonState('idle');
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
            w2ui.currentuploadtoolbar.disable('pauseUpload','startUpload');
            w2ui.currentuploadtoolbar.enable('resumeUpload','stopUpload');            
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
                let fileInQueue=fileQueue.find(entry => entry.file.name === file.metadata.metadata.filename);
                
                if(uploadStatus=="Interrupted"&&!fileInQueue)
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
    fileResumptionInput.value="";    
    fileResumptionDrop.style.textAlign="center";
    fileResumptionDrop.textContent = "Drag and drop files here";
    selectResumptionFileButton.disabled=true;
    if(fileList.length==1)
    {  
        const theFile = fileList[0];
        const theFileRecord = w2ui.pendinguploadsgrid.get(theFile)
        const uploader = theFileRecord.uploaded_by;
        if(uploader!==cpfNoInput.value)
        {
            opNotAllowedLabel.textContent="Cannot resume pending upload";
            opNotAllowedText.textContent=`The upload for file ${theFileRecord.filename} has been initiated by another user '${theFileRecord.uploaded_by}'.
                The upload can be resumed by that user only.
                `; 
            fileToResume="";
            $('#opNotAllowedModal').modal('show');
        }
        else
        {
            fileResumptionDrop.style.textAlign="center";
            fileResumptionDrop.textContent = "Drag and drop the file here";
            resumptionFileLabel.textContent=theFileRecord.filename 
            fileToResume=theFileRecord.filename;
            $('#fileResumptionModal').modal('show');
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
      if(lastUpload)
        {          
            const currUploadFileName=lastUpload.file.name; // File just uploaded  
            if(currUploadFileName==result.filename&&result.status === 'Success'){
               // clearFileInput();
                statusMessage.textContent = "";                
                selectedFileLabel.value="";
                w2ui.currentuploadtoolbar.set('currentFilelabel',{value:""});
                //selectFileButton.disabled=true;
                //fileDrop.style.textAlign="center";
                //fileDrop.textContent = "Drag and drop files here";
                resetProgress();
                renderQueue(fileQueue);
            }              
        }


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
                    
        var fileResult;
        if(fileGridName==='grid')
        {
            if(lastUpload){
                const currUploadFileName=lastUpload.file.name; // File just uploaded
                //console.log(currUploadFileName);
                fileResult = result.find(entry => entry.file === currUploadFileName);
                if(fileResult&&fileResult.status === 'Success'){
                    statusMessage.textContent = fileGridName==='pendinguploadsgrid'?"Upload Cancelled":"";       
                    selectedFileLabel.value="";
                    w2ui.currentuploadtoolbar.set('currentFilelabel',{value:""});
                    resetProgress();
                    renderQueue(fileQueue);
                }
            }
            
        }
        /*else if(fileGridName==='pendinguploadsgrid')
        {
            if(upload){
                const currUploadFileId=(upload.url).substring(((upload.url).lastIndexOf('/'))+1);// File being uploaded currently
                fileResult = result.find(entry => entry.file === currUploadFileId);
                if(fileResult&&fileResult.status === 'Success'){
                    statusMessage.textContent = fileGridName==='pendinguploadsgrid'?"Upload Cancelled":"";       
                    selectedFileLabel.value="";    
                    w2ui.currentuploadtoolbar.set('currentFilelabel',{value:""});                    
                    resetProgress();
                    renderQueue(fileQueue);
                }
            }
        }    */            
            
            
            
        

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
    

