(window.onload = function(){
	if (window.File && window.FileReader && window.FileList && window.Blob) {
 	// Great success! All the File APIs are supported.
	} else {
  	alert('The File APIs are not fully supported in this browser.');
	}

	const handleFileSelect = function(e){

		//debug
		// console.log(e);

		let output = [];
		let file = e.target.files[0];//retrive FileList Object

		//collect file attributes
		output.push('<il><strong>', file.name, '</strong> (',
		file.type || 'n/a', ') - ',
		file.size/1000.0, ' kb, last modified: ', 
		file.lastModified ? new Date(file.lastModified).toLocaleDateString() : 'n/a',
		'</li>');
		//output attributes to dom
		document.getElementById("FileInfo").innerHTML = `<ul> ${output.join('')} </ul>`;


		//type check
		// if(!file.type.match('.xlsx')){
		// 	console.log('Invalid File type');
		// 	continue;
		// }
		//read file contents
		let reader = new FileReader();

		reader.onload = function (e){
			// console.log("reader onload");
			// console.log(e);
			let data = e.target.result;

			let workbook = XLSX.read(data, {type: 'binary'});

			let worksheet = workbook.Sheets[workbook.SheetNames[0]];
			console.log(worksheet);
			buildTable(XLSX.utils.sheet_to_json(worksheet));
			// console.log(JSON.stringify(XLSX.utils.sheet_to_json(worksheet)));

			// let sheetHTML = XLSX.utils.sheet_to_html(worksheet);
			// document.querySelector('#SheetData').innerHTML = sheetHTML;

		};
		reader.readAsBinaryString(file);
	}

	const buildTable = function(JSONdata){
		let dataContainer = document.querySelector('#SheetData');
		let hot = new Handsontable(dataContainer, {
			'data': JSONdata,
			'rowHeaders': true,
			'colHeaders': true,
			'filters': true,
			'dropdownMenu': true 
		});
	};

	document.querySelector('#xlfile').addEventListener('change', handleFileSelect, false);





    // document.getElementById("xlfile").addEventListener('change', function(e){
        
    //     let reader = new FileReader();

    //     reader.onload = function(e){
    //         var data = e.target.result;
    //         var workbook = XLSX.read(data, {type : 'binary'});

    //     }
    //     reader.readAsBinaryString(f);
    // }, false);


})();

