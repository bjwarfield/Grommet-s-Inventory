/* jshint esversion: 6 */
(window.onload = function () {
	//table Data
	let file, workbook, worksheet, JSONData, JSONBackup;
	//HandsonTable object
	let hot;
	//save Tracker
	let saveLoop, isDirty;


	//DOM Utility Functions
	const DOM = function (selector) {
		return document.querySelector(selector);
	};
	const DOMs = function (selector) {
		return document.querySelectorAll(selector);
	};


	//check for File API
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		// Great success! All the File APIs are supported.
	} else {
		alert('The File APIs are not fully supported in this browser.');
	}

	//Initialize App
	const InitApp = function () {
		//check for Local Storage API
		if (typeof (Storage) == 'undefined') {
			DOM('#FileInfo').innerHTML = `<p>HTML5 localStorage not supported</p>`;
		}

		//clear lingering backups
		if (localStorage.getItem('JSONBackup')) {
			localStorage.removeItem('JSONBackup');
		}

		//check for stored data, load if exists
		if (localStorage.getItem('WorkSheetData')) {
			JSONData = JSON.parse(localStorage.getItem('WorkSheetData'));
			buildTable(JSONData);
		}
	};

	//
	const ChangeCallback = function (changes, source) {
		isDirty = true;
		DOM('#FileInfo').innerHTML = `<p>Unsaved Changes Pending</p>`;
		DOM('#FileInfo').style.backgroundColor = 'lightpink';
	};


	const SaveProgress = function () {
		if (!JSONData || JSONData == null || typeof JSONData == 'undefined') {
			DOM('#FileInfo').innerHTML = `<p>No Data To Save</p>`;
			return false;
		}
		if (isDirty) {
			localStorage.setItem('WorkSheetData', JSON.stringify(JSONData));
			DOM('#FileInfo').innerHTML = `<p>Changes Saved</p>`;
			DOM('#FileInfo').style.backgroundColor = 'lightgreen';
			isDirty = false;
		}
		return true;
	};

	const ExportJSON = function(){
		let f = new Blob([JSON.stringify(JSONData)], {type: 'text/plain'});
		let a = document.createElement('a');
		let url = URL.createObjectURL(f);

		a.href = url;
		a.download = 'json.txt';
		document.body.appendChild(a);
		a.click();
		setTimeout(function(){
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		}, 0);

	};

	const ClearData = function () {
		clearInterval(saveLoop);
		if (hot) {
			hot.loadData([]);
		}
		if (JSONData && JSONData != null && typeof JSONData != 'undefined') {
			
			JSONBackup = JSON.parse(JSON.stringify(JSONData)) ;
		
			JSONData = null;
		}
		localStorage.removeItem('WorkSheetData');
		DOM('#UndoNotify').innerHTML = `<button id='UndoClear'>Data Cleared, Undo?</button>`;
		DOM(`#UndoClear`).addEventListener('click', function (e) {
			localStorage.setItem(
				'WorkSheetData',
				JSON.stringify(JSONBackup)
			);
			JSONBackup = null;
			DOM('#UndoNotify').innerHTML = 'Data Restored';
			InitApp();
		});
		setTimeout(function(){DOM('#UndoNotify').innerHTML = '';}, 30000);
		

	};



	const DownloadFile = function () {
		if (isDirty) {
			if (!SaveProgress()) {
				return;
			}
		}


		worksheet = XLSX.utils.json_to_sheet(
			JSON.parse(localStorage.getItem('WorkSheetData'))
		);
		if(workbook){
			workbook.Sheets[workbook.SheetNames[0]] = worksheet;
		}else{
			workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

		}
		

		XLSX.writeFile(workbook, file ? file.name : 'Inventory Sheet.xlsx', {
			compression: true
		});
	};

	//open and parse excel file. Exports data as JSON to HandsonTable Builder funciton
	const handleFileSelect = function (e) {
		let undo = false;
		if (typeof JSONData != 'undefined') {
			JSONBackup = JSON.parse(JSON.stringify(JSONData)) ;
			undo = true;
		}
		// console.log(e);

		file = e.target.files[0]; //retrive FileList Object

		//read file contents
		let reader = new FileReader();

		reader.onload = function (e) {
			// console.log("reader onload");
			// console.log(e);
			let data = e.target.result;

			workbook = XLSX.read(data, {
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
				file = null;
				workbook = null;
				worksheet = null;
				JSONData = null;
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

		if (undo) {
			DOM('#UndoNotify').innerHTML = `<button id='UndoOverwrite'>Existing Data overwritten, Undo?</button>`;
			DOM(`#UndoOverwrite`).addEventListener('click', function (e) {
				localStorage.setItem(
					'WorkSheetData',
					JSON.stringify(JSONBackup)
				);
				JSONBackup = null;
				DOM('#UndoNotify').innerHTML = '';
				InitApp();
			});
		}
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
		Handsontable.hooks.add('afterChange', ChangeCallback);
		isDirty = true;
		SaveProgress();
		saveLoop = setInterval(SaveProgress, 30000);
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

		let rowData = hot.getDataAtRow(row);


		if (tally) {
			let count = parseInt(rowData[9]);
			if (isNaN(count)) count = 0;

			rowData[9] = ++count;
			hot.setDataAtCell(row, 9, rowData[9]);
		}
		return rowData;
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
	DOM('#ClearButton').addEventListener('click', ClearData, false);
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
	// DOMs('.save-btn').forEach(function (dom) {
	// 	dom.addEventListener('click', SaveProgress);
	// }, false);
	DOM('#DownloadButton').addEventListener('click', DownloadFile, false);
	DOM("#FileForm").reset();
	InitApp();

});