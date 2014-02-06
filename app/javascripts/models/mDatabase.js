'use strict';


/* ==================================================================

TODO: may need to encodeURIComponent the db/collection names
-----------------------------------------------------------------*/

angular.module('phpMongoAdmin.mDatabase', []).factory('phpMongoAdmin.mDatabase', ['$http', '$rootScope', function($http, $rootScope) {

	$rootScope.client = {}; //The last copy of the client info
	$rootScope.databases = {}; //The last copy of the list of databases and info
	$rootScope.allCollections = {}; //The collections for the various databases
	$rootScope.allIndexes = []; //The collections for the various databases
	$rootScope.documents = []; // the array of documents that we are currently viewing

	var apiPath = $$config.apiPath;

	//==================================================================
	// Initialize the database array from the server
	function init() {
		if($rootScope.databases.length) return; //already initialized

		console.log("mDatabase INIT");

		$http.get(apiPath + '/databases.php')
			.success(function(data) {
				$rootScope.databases = data;
				console.log("mDatabase INIT final");
				// console.table(data);
				$rootScope.$broadcast('update_databases');
			})
			.error(function(data) {
				console.log("ERROR FETCHING mDatabase",data);
			});

		$http.get(apiPath + '/client.php')
			.success(function(data) {
				$rootScope.client = data;
				console.log(data);
				$rootScope.$broadcast('update_databases');
			})
			.error(function(data) {
				console.log("ERROR FETCHING client",data);
			});
	};

	//==================================================================
	// Gets one db by name 
	function get(dbname) {
		console.log("get db",dbname,$rootScope.databases);
		return $rootScope.databases[dbname];
	};

	//==================================================================
	// Gets collections for this db 
	function getCollections(dbname) {
		console.log("getCollections",dbname,$rootScope.databases);

		if($rootScope.allCollections[dbname]!=undefined) return $rootScope.allCollections[dbname];

		$http.get(apiPath + '/collections.php?db='+dbname)
			.success(function(data) {
				$rootScope.allCollections[dbname] = data;
				$rootScope.allIndexes[dbname] = {};
				console.log("Collections Got");
//				console.log(data);
				$rootScope.$broadcast('update_collections');
			})
			.error(function(data) {
				console.log("ERROR FETCHING collections",data);
			});
	};

	//==================================================================
	// Gets indexes for this db and collection
	function getIndexes(dbname,collection) {
		console.log("getIndexes",dbname,collection);

		if($rootScope.allIndexes[dbname]!=undefined && $rootScope.allIndexes[dbname][collection]!=undefined) return $rootScope.allIndexes[dbname][collection];

		$http.get(apiPath + '/indexes.php?db='+dbname+'&col='+collection)
			.success(function(data) {
				if($rootScope.allIndexes[dbname]==undefined) $rootScope.allIndexes[dbname]={};
				$rootScope.allIndexes[dbname][collection] = data;
				console.log("Indexes Got");
				console.log(data);
				$rootScope.$broadcast('update_indexes');
			})
			.error(function(data) {
				console.log("ERROR FETCHING indexes",data);
			});
	};

	//==================================================================
	// Adds one index
	function addIndex(dbname,collection,name,index) {
		if(!index) return;
		
		console.log("addIndex",dbname,collection,name,index);

		$http.post(apiPath + '/index_add.php','db='+dbname+'&col='+collection+'&name='+name+'&index='+index, {'headers': {'Content-Type': 'application/x-www-form-urlencoded'}})
			.success(function(data) {
				console.log("added indexes",data);

				$rootScope.allIndexes[dbname]=undefined;
				getIndexes(dbname,collection);
			})
			.error(function(data) {
				console.log("ERROR FETCHING indexes",data);
			});
	};

	//==================================================================
	// Deletes one index
	function deleteIndex(dbname,collection,index) {
		if(!index) return;

		console.log("deleteIndexes",dbname,collection,index);

		$http.post(apiPath + '/index_remove.php','db='+dbname+'&col='+collection+'&index='+index, {'headers': {'Content-Type': 'application/x-www-form-urlencoded'}})
			.success(function(data) {
				console.log("deleted indexes",data);

				$rootScope.allIndexes[dbname]=undefined;
				getIndexes(dbname,collection);
			})
			.error(function(data) {
				console.log("ERROR deleting indexes",data);
			});
	};

	//==================================================================
	// Gets documents for this db and collection
	function getDocuments(dbname,collection,query,fields,sort,page,num) {
		page--; //1 indexed to 0 indexed conversion
		
		console.log("getDocuments",dbname,collection,query,fields,sort,page,num);

		$rootScope.documents = [];
		
		$http.get(apiPath + '/documents.php?db='+dbname+'&col='+collection+'&query='+query+'&fields='+fields+'&sort='+sort+'&page='+page+'&num='+num)
			.success(function(data) {
				$rootScope.documents = data;
				console.log("docs Got");
				console.log(data);
				$rootScope.$broadcast('update_docs');
			})
			.error(function(data) {
				console.log("ERROR FETCHING docs",data);
			});
	};

	//==================================================================
	// Gets one document
	function getDocument(dbname,collection,id) {
		
		console.log("getDocument",dbname,collection,id);

		$rootScope.document = {};
		
		$http.get(apiPath + '/document.php?db='+dbname+'&col='+collection+'&id='+id)
			.success(function(data) {
				$rootScope.document = data;
				console.log("doc Got");
				console.log(data);
				$rootScope.$broadcast('update_doc');
			})
			.error(function(data) {
				console.log("ERROR FETCHING doc",data);
			});
	};

	return {
		init: init, get: get, getCollections:getCollections, getIndexes:getIndexes, deleteIndex:deleteIndex, addIndex:addIndex, getDocuments:getDocuments, getDocument:getDocument
	};
}]); //end factory and module
