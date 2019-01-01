(window.onload = function () {

	let hot;

	if (window.File && window.FileReader && window.FileList && window.Blob) {
		// Great success! All the File APIs are supported.
	} else {
		alert('The File APIs are not fully supported in this browser.');
	}

	const handleFileSelect = function (e) {

		//debug
		// console.log(e);

		let output = [];
		let file = e.target.files[0]; //retrive FileList Object

		//collect file attributes
		output.push('<il><strong>', file.name, '</strong> (',
			file.type || 'n/a', ') - ',
			file.size / 1000.0, ' kb, last modified: ',
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

		reader.onload = function (e) {
			// console.log("reader onload");
			// console.log(e);
			let data = e.target.result;

			let workbook = XLSX.read(data, {
				type: 'binary'
			});

			let worksheet = workbook.Sheets[workbook.SheetNames[0]];
			// console.log(worksheet);
			buildTable(XLSX.utils.sheet_to_json(worksheet, {
				defval: ""
			}));
			console.log(XLSX.utils.sheet_to_json(worksheet, {
				defval: ""
			}));

			// let sheetHTML = XLSX.utils.sheet_to_html(worksheet);
			// document.querySelector('#SheetData').innerHTML = sheetHTML;

		};
		reader.readAsBinaryString(file);
	}




	//handsontable builder plugin. pass JSON table data
	const buildTable = function (JSONdata) {
		let keys =  Object.keys(JSONdata[0])
		hot = new Handsontable(document.querySelector('#SheetData'), {
			data: JSONdata,
			readOnly: true,
			columns: [{
				type: 'numeric',
				data: keys[0]
			}, {
				type: 'text',
				data: keys[1]
			}, {
				type: 'numeric',
				data: keys[2]
			}, {
				type: 'text',
				data: keys[3]
			}, {
				type: 'text',
				data: keys[4]
			}, {
				type: 'text',
				data: keys[5]
			}, {
				type: 'text',
				data: keys[6]
			}, {
				type: 'text',
				data: keys[7]
			}, {
				type: 'numeric',
				data: keys[8]
			}, {
				type: 'numeric',
				data: keys[9]
			}],
			rowHeaders: true,
			colHeaders: function (index) {
				return keys[index];
			}, //set col header to key values
			dropdownMenu: ['filter_by_value', 'filter_action_bar'],
			filters: true,
			columnSorting: true
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