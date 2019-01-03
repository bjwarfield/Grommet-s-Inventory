/* jshint esversion: 6 */
(window.onload = function () {
	//table Data
	let JSONData;
	//HandsonTable object
	let hot;


	//DOM Utility Functions
	const DOM = function (selector) {
		return document.querySelector(selector);
	};
	const DOMs = function (selector) {
		return document.querySelectorAll(selector);
	};


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
			JSONData = XLSX.utils.sheet_to_json(worksheet, {
				defval: ""
			});

			//validate file by key values
			let validKeys = ["Item #", "Alternate Lookup", "UPC",
				"Vendor Name", "Item Name", "Attribute",
				"Size", "Department", " Expected Count",
				"Physical Count"
			];

			let fileKeys;
			try {
				fileKeys = Object.keys(JSONData[0]);
			} catch (err) {
				console.log(err);
				alert("Incorrect File Selected");
				DOM("#FileInfo").innerHTML = '';
				DOM("#FileForm").reset();
				if (hot) {
					hot.loadData([]);
					console.log("Clearing Table Data");
				}
				return;
			}

			if (!fileKeys || fileKeys.toString() !== validKeys.toString()) {
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
	};

	//handsontable builder plugin. pass JSON table data
	const buildTable = function (JSONdata) {
		let keys = Object.keys(JSONdata[0]);
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

		// console.log(hot);
	};

	//Quick Scan Utility Functions

	//array list of QuickScan Form DOM Fields
	const DOM_QuickScanFields = [
		DOM('#ScanItemNum'),
		DOM('#ScanALU'),
		DOM('#ScanUPC'),
		DOM('#ScanVendorName'),
		DOM('#ScanItemName'),
		DOM('#ScanAttribute'),
		DOM('#ScanSize'),
		DOM('#ScanDepartment'),
		DOM('#ScanExpectedCount'),
		DOM('#ScanCurrentCount')
	];
	const FillQuickScanFields = function (rowData) {
		for (let i = 0; i < DOM_QuickScanFields.length; i++) {
			DOM_QuickScanFields[i].value = rowData[i];
		}
	};
	const ClearQuickScanFields = function () {
		for (let i = 0; i < DOM_QuickScanFields.length; i++) {
			DOM_QuickScanFields[i].value = '';
		}
	};

	//set box focus and select current input
	const InitScanForm = function () {
		DOM('#ScanEntry').focus();
		DOM('#ScanEntry').select();
	};

	//custom numeric query function for HandsonTable search plugin
	const NumericQuery = function (q, v) {
		v = parseInt(v);
		if (typeof q == 'undefined' || q === null) {
			return false;
		}
		if (isNaN(v), typeof v == 'undefined' || v === null) {
			return false;
		}
		return v == q;
	};

	const QuickScan = function (e) {
		e.preventDefault();

		let query = parseInt(DOM('#ScanEntry').value);

		if (isNaN(query)) {
			alert(`Item# or UPC scans only`);
			ClearQuickScanFields();
			InitScanForm();
			return;
		}



		console.log(`Quick Scanning for ${query}`);
		let search = hot.getPlugin('search');

		//query 
		let queryResult = search.query(query, null, NumericQuery);
		// console.log("Query Result:");

		let rowData = ScanQeury(query, queryResult, true);

		if (rowData) {
			FillQuickScanFields(rowData);
			InitScanForm();
		} else {
			alert(`Item not found`);
			ClearQuickScanFields();
			InitScanForm();
		}

		// console.log(rowData);

	};

	//quert values based on item #
	// const QueryItemNum = function (query, queryResult, tally = false){
	// 	let row;
	// 	try{
	// 		row = queryResult.filter(cell => cell.col == 0 && cell.data == query)[0].row;
	// 		console.log(row);
	// 		console.log(queryResult.filter(cell => cell.col == 0 && cell.data == query));
	// 	}catch(e){return null;}


	// 	if(tally){
	// 		let count = hot.getDataAtCell(row,9);
	// 		if(count == '')count = 0;
	// 		hot.setDataAtCell(row,9,++count);
	// 	}
	// 	return hot.getDataAtRow(row);
	// }

	// //query based on UPC
	// const QueryUPC = function (query, queryResult, tally = false){
	// 	let row 
	// 	try{
	// 		row = queryResult.filter(cell => cell.col == 2 && cell.data == query)[0].row;
	// 	}catch(e){return null;}

	// 	if(tally){
	// 		let count = hot.getDataAtCell(row,9);
	// 		if(count == '')count = 0;
	// 		hot.setDataAtCell(row,9,++count);
	// 	}
	// 	return hot.getDataAtRow(row);
	// }

	const ScanQeury = function (query, queryResult, tally = false) {
		let filter, row;
		//filter by Item # (column 0)
		filter = queryResult.filter(cell => cell.col == 0 && cell.data == query);
		//if empty filter by UPC (column 2)
		if (filter.length == 0) {
			filter = queryResult.filter(cell => cell.col == 2 && cell.data == query);
		}
		if (filter.length == 0) return null;
		
		// console.log(filter);
		row = filter[0].row;

		if (tally) {
			let count = parseInt(hot.getDataAtCell(row, 9));
			if (isNaN(count)) count = 0;
			count++;

			hot.setDataAtCell(row, 9, count);
		}
		return hot.getDataAtRow(row);
	};

	//opens ScanModal
	const OpenScanModal = function () {
		ClearQuickScanFields();
		DOM('#ScanEntry').value = '';
		DOM("#ScanModal").style.display = 'flex';
		InitScanForm();
	};
	//close ScanModal
	const CloseScanModal = function () {
		DOM("#ScanModal").style.display = 'none';
	};

	//addEventListeners to DOM elements
	DOM("#xlfile").addEventListener('change', handleFileSelect, false);
	DOM("#QuickScan").addEventListener('click', OpenScanModal, false);
	DOM("#ScanForm").addEventListener('submit', QuickScan, false);
	DOM("#ScanModal").addEventListener('click', CloseScanModal, false);
	//clicking on modal bg closes modal.
	DOM("#ScanCloseBtn").addEventListener('click', CloseScanModal, false);
	//clicking on mocal content does not
	DOMs(".modal-content").forEach(function (dom) {
		dom.addEventListener('click', function (e) {
			e.stopPropagation();
		}, false);
	});
	DOM("#FileForm").reset();
	

});