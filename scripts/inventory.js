(function(){
    document.getElementById("xlfile").addEventListener('change', function(e){
        
        let reader = new FileReader();

        reader.onload = function(e){
            var data = e.target.result;
            var workbook = XLSX.read(data, {type : 'binary'});

        }
        reader.readAsBinaryString(f);
    }, false);


})();