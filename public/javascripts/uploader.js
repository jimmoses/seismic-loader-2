var fileInput=document.getElementById('fileInput');
var fileError = document.getElementById('fileError');
var startButton   = document.querySelector("#startUpload");
var pauseButton   = document.querySelector("#pauseUpload");
var resumeButton = document.querySelector("#resumeUpload");
var confirmDeleteButton = document.querySelector("#confirmDeleteButton");
var confirmStopButton = document.querySelector("#confirmStopButton");
const stopButton = document.getElementById('stopUpload');
const statusMessage = document.getElementById('statusMessage');
const progressBar = document.getElementById('uploadProgress');
const bytesTransferred = document.getElementById('bytesTransferred');



var upload;
var uploadFileId;
var file;
const allowedExtensions = ['.segy', '.sgy'];
const uploadEndpoint='http://localhost:1080/files/';
const fileListingEndpoint='http://localhost:3000/files';


updateButtonState('idle');

fileInput.addEventListener('change', function (e) {
    // Get the selected file from the input element
    file = e.target.files[0]
    statusMessage.textContent = "Ready to upload...";
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
        fileError.textContent = `File type not allowed. Only ${allowedExtensions.join(', ')} files are accepted.`;
        statusMessage.textContent = "";
        startButton.disabled = true;
    } else {
        fileError.textContent = ''; // Clear the error message
        statusMessage.textContent = "Ready to upload...";
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
                clearFileInput();
            },
        })
        startButton.disabled = false;
    }
    

})


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

startButton.addEventListener("click", function() {
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
    
})

confirmStopButton.addEventListener("click", function() {

    $('#stopConfirmationModal').modal('hide');
    upload.abort();
    statusMessage.textContent = "Upload Cancelled";
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
    progressBar.setAttribute('aria-valuenow', 0);
    bytesTransferred.textContent = '';
    
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
                listFiles();     
                if(upload)
                {
                    const currUploadFileId=(upload.url).substring(((upload.url).lastIndexOf('/'))+1);// File being uploaded currently
                    const fileToDeleteId=uploadUrl.substring(((uploadUrl).lastIndexOf('/'))+1);
                    if(currUploadFileId==fileToDeleteId)
                    {
                        clearFileInput();
                        statusMessage.textContent = "Upload Cancelled";
                        progressBar.style.width = '0%';
                        progressBar.textContent = '0%';
                        progressBar.setAttribute('aria-valuenow', 0);
                        bytesTransferred.textContent = '';
                    }
                    
                }
                
            } else {
                console.error('Failed to delete file', response.status, response.statusText);
            }
        })
        .catch((error) => {
            console.error('Error deleting file:', error);
        });
}

function updateButtonState(status) {
    listFiles();
    switch (status) {
        case 'idle': // No upload in progress
            startButton.disabled = true;
            pauseButton.disabled = true;
            resumeButton.disabled = true;
            stopButton.disabled = true;
            
            break;
        case 'uploading': // Upload in progress
            startButton.disabled = true;
            pauseButton.disabled = false;
            resumeButton.disabled = true;
            stopButton.disabled = false;
            break;
        case 'paused': // Upload paused
            startButton.disabled = true;
            pauseButton.disabled = true;
            resumeButton.disabled = false;
            stopButton.disabled = false;
            break;
        case 'completed': // Upload completed
            startButton.disabled = false;
            pauseButton.disabled = true;
            resumeButton.disabled = true;
            stopButton.disabled = true;
            break;
        case 'stopped': // Upload stopped
            startButton.disabled = false;
            pauseButton.disabled = true;
            resumeButton.disabled = true;
            stopButton.disabled = true;
            break;
    }
}

function listFiles(){
    fetch(fileListingEndpoint)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('uploaded-files-list');

            tableBody.innerHTML = '';  // Clear the list            
            
            // Loop through the files and create table rows for each
            data.forEach(file => {
                
                //console.log(file.fileSizeInBytes)
                const uploadStatus = file.fileSizeInBytes===file.metadata.size ? 'Complete' : 'Interrupted';
                
                if(uploadStatus=="Interrupted"&&uploadFileId!=file.metadata.id)
                {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${file.metadata.metadata.filename}</td>
                        <td>${formatBytes(file.metadata.size)}</td>
                        
                    
                        <td>${file.metadata.creation_date || 'Unknown'}</td>                        
                        <td>${Math.floor((file.fileSizeInBytes)*100/(file.metadata.size))}%</td>
                    <td><i class="bi bi-trash delete-icon" data-file-id="${file.metadata.id}"></td>
                    `;    
                    tableBody.appendChild(row);
                }                  
           
        });
        document.querySelectorAll('.delete-icon').forEach(icon => {
            icon.addEventListener('click', deleteOldFile);
        });
    });

    
}



function deleteOldFile(event) {
    

    const icon = event.currentTarget;
    const fileToDeleteId = icon.getAttribute('data-file-id');   

    $('#confirmDeleteButton').attr('delete-file-id',fileToDeleteId);
    $('#deleteConfirmationModal').modal('show');
    
    
    

    
}
confirmDeleteButton.addEventListener("click", function() {

    const fileToDeleteId = $(this).attr('delete-file-id');
    deleteFile(uploadEndpoint+"/"+fileToDeleteId);
    
    $('#deleteConfirmationModal').modal('hide');
    
})
    

