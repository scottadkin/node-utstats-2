"use client"

async function bulkUpload(mode, data){

    try{


        const formData = new FormData();

        formData.set("mode", mode);

        for(let i = 0; i < data.files.length; i++){

            const d = data.files[i];
            formData.append("file", d);
        }

        const response = await fetch("/api/adminUpload", {
            method: "POST",
            //"headers": {"Content-type": "multipart/form-data"},
            body: formData,
          });

          const result = await response.json();
          console.log(result);

        return;

        const req = await fetch("/api/admin", {
            "method": "POST",
            "headers": {"Content-type": "application/json"},
            "body":  JSON.stringify({
                "mode": "upload-map-sshot", 
                "data": data
            })
        });

        const res = await req.json();

    }catch(err){
        console.trace(err);
    }
}


const Form = () => {
  return (
    <input
      type="file"
      name="file"
      onChange={async (e) => {
        if (e.target.files) {
          const formData = new FormData();
          Object.values(e.target.files).forEach((file) => {
            formData.append("file", file);
          });

          const response = await fetch("/api/adminUpload", {
            method: "POST",
            //"headers": {"Content-type": "multipart/form-data"},
            body: formData,
          });

          const result = await response.json();
          console.log(result);
        }
      }}
    />
  );
};

function renderBulkUpload(){

    return <form className="form" onSubmit={(e) =>{
        
        e.preventDefault();
        console.log(e.target);
        console.log(e.target.filesToUpload);

        bulkUpload(e.target.mode.value, e.target.filesToUpload);
    }}>
        <input type="file" multiple name="filesToUpload" id="files"/>
        <input type="hidden" name="mode" value="map-bulk-upload"/>
        <input type="submit" value="Upload Images"/>
    </form>
}

export default function AdminMapScreenshots(){
 
    return <>
        <div className="default-header">Map Screenshots Manager</div>
        {renderBulkUpload()}
    </>
}