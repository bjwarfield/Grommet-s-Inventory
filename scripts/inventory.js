(window.onload = function () {
	//HandsonTable object
	let hot;
	

	//DOM Utility Functions
	const DOM = function(selector){
		return document.querySelector(selector);
	}
	const DOMs = function(selector){
		return document.querySelectorAll(selector);
	}


	if (window.File && window.FileReader && window.FileList && window.Blob) {
		// Great success! All the File APIs are supported.
	} else {
		alert('The File APIs are not fully supported in this browser.');
	}

	//open and parse excel file. Exports data as JSON to HandsonTable Builder funciton
	const handleFileSelect = function (e) {
		
		// console.log(e);

		let output = [];
		let file = e.target.files[0]; //retrive FileList Object

		//collect file attributes
		output.push('File size: ',
			file.size / 1000.0, ' kb, last modified: ',
			file.lastModified ? new Date(file.lastModified).toLocaleString() : 'n/a');
		//output attributes to dom
		DOM("#FileInfo").innerHTML = `<p> ${output.join('')} </p>`;


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
			let JSONData = XLSX.utils.sheet_to_json(worksheet, {defval: ""});

			//validate file by key values
			let validKeys = [ "Item #", "Alternate Lookup", "UPC",
							 "Vendor Name", "Item Name", "Attribute", 
							 "Size", "Department", " Expected Count", 
							 "Physical Count" ];

			let fileKeys 
			try{
				fileKeys =  Object.keys(JSONData[0]);
			}catch(err){
				console.log(err);
				alert("Incorrect File Selected");
				DOM("#FileInfo").innerHTML = '';
				DOM("#FileForm").reset();
				if(hot){
					hot.loadData([]);
					console.log("Clearing Table Data")
				}
				return;
			}

			if(! fileKeys || fileKeys.toString() !== validKeys.toString()){
				alert("Incorrect File Selected");
				console.log('fileKeys');
				console.log(fileKeys);
				console.log('validKeys');
				console.log(validKeys);
				hot.loadData([]);
				return;
			}

			// console.log(worksheet);
			buildTable(JSONData);
			// console.log(JSONData);

			// let sheetHTML = XLSX.utils.sheet_to_html(worksheet);
			// document.querySelector('#SheetData').innerHTML = sheetHTML;

		};
		reader.readAsBinaryString(file);
	}




	//handsontable builder plugin. pass JSON table data
	const buildTable = function (JSONdata) {
		let keys =  Object.keys(JSONdata[0]);
		// console.log(keys);
		hot = new Handsontable(DOM("#SheetData"), {
			data: JSONdata,
			search: true,
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
				validator: 'numeric',
				data: keys[9],
				readOnly: false
			}],
			rowHeaders: true,
			colHeaders: function (index) {
				return keys[index];
			}, //set col header to key values
			dropdownMenu: ['filter_by_value', 'filter_action_bar'],
			filters: true,
			columnSorting: true
		});

		console.log(hot);
	};

	//quert values based on item #

	//opens ScanModal
	const OpenScanModal = function (){
		DOM("#ScanModal").style.display = 'flex';
	};
	//close ScanModal
	const CloseScanModal = function(){
		DOM("#ScanModal").style.display = 'none';
	};

	//addEventListeners to DOM elements
	DOM("#xlfile").addEventListener('change', handleFileSelect, false);
	DOM("#QuickScan").addEventListener('click', OpenScanModal, false);
	DOM("#ScanModal").addEventListener('click', CloseScanModal, false);
	//clicking on modal bg closes modal.
	DOM("#ScanCloseBtn").addEventListener('click', CloseScanModal, false);
	//clicking on mocal content does not
	DOMs(".modal-content").forEach(function (dom){
		dom.addEventListener('click', function(e){e.stopPropagation();}, false);
	});

});