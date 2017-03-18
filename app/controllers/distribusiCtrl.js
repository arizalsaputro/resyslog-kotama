app.controller('distribusiCtrl',['$scope','DialogUtils','RestDB',function ($scope,DialogUtils,RestDB) {
    	$scope.setTitle("Distribusi"); 
    	$scope.getStatusByID=function(status){
    		switch(status){
    			case 0:
    				return "dalam pengiriman";
    				break;
    			case 1:
    				return "diterima";
    				break;
    		}

    	};
    	$scope.checkDistribusii=function(id){
    		if(id == localStorage.getItem('idk')){
    			return true;
    		}
    		return false;
    	};

    	var nomor = [0,0,0];

      $scope.getNomor=function(pil){
        return ++nomor[pil];
      };

      $scope.openActionDistribusi=function(ev,distri){
        var config = {};
        config.title = "Apakah alusista sudah sampai?";
        config.content = "Klik iya maka alusista akan ditambahkan ke inventoris";
        config.label = "apa sudah samapai";
        DialogUtils.showConfirm(ev,config).then(function(bisa){
                      var spiner = DialogUtils.createProgress();
                      spiner.setColor('#FFEB3B');
                      spiner.start();

                    var url = "operasi/kotama/"+localStorage.getItem('idk') +"/inventoris" ;
                    var ob = RestDB.getFirebase(url);

                    var config = {
                        'id_jenis' : distri.id_jenis,
                        'jumlah' : distri.jumlah,
                        'time' : Firebase.ServerValue.TIMESTAMP
                    };

                    ob.push(config);
                    var url2 = "distribusi/"+ distri.$id;
                    var tmp = {};
                    tmp.status = 1;
                    tmp.time_arrive = Firebase.ServerValue.TIMESTAMP;
                    RestDB.updateData(url2,tmp).then(function(res){
                       console.log('updated');
                    });

                    var url3 = "inventori/inventoris/"+distri.id_jenis +"/use/" + localStorage.getItem('idk');
                    var finjum = distri.jumlah;
                    
                    RestDB.getOnceData(url3+"/jumlah").then(function(data){
                        if(data != null){
                            finjum = finjum + data;
                        }   
                        var tmplagi = {};
                        tmplagi.jumlah = finjum;
                        RestDB.updateData(url3,tmplagi).then(function(res){
                           console.log('updated');
                        });

                    });

                    
                     spiner.complete();
        },function(tidak){
           
        });
      };

}]);