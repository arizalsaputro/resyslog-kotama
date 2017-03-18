app.controller('loginCtrl',['$scope','currentAuth','DBAuthHelper','DialogUtils','ErorException','$state','ToastUtils','$http','RestDB',function ($scope,currentAuth,DBAuthHelper,DialogUtils,ErorException,$state,ToastUtils,$http,RestDB) {
   	if(currentAuth){
   		$state.go('dash.inventaris');
         
   	}


     $scope.isDisabled = false;
    $scope.isNoCache = false;
    $scope.searchText = "";
    $scope.selectedItem = null;

    $http.get('app/data/kotama.json').success(function(data) {
       $scope.listKotama = data.kotama;
       
    });

    $scope.onItemSelected=function(item){
      $scope.selectedItem = item;
    };

   $scope.datalogin = {};
   var auth = DBAuthHelper.getAuth();
   var statuslog = false;
   function isadministator(ev,bisa){
       RestDB.getOnceData("operasi/kotama/"+$scope.selectedItem.kd_ktm + "/email").then(function(data){
            if(data == bisa.password.email){
               $state.go('dash.inventaris');
               localStorage.setItem('idk', $scope.selectedItem.kd_ktm);
               return;
            }else{
               statuslog = false;
               auth.$unauth();
               ErorException.checkError(ev,"NOT_ADMIN");
            }
       });  
   }

   $scope.checkOnChange=function(ev){
   	  if(!statuslog){
   	  	if($scope.datalogin.email && $scope.datalogin.password && ($scope.selectedItem != null)){
	   	 	statuslog=true;
	   	 	DBAuthHelper.loginUsers(auth,$scope.datalogin).then(function(bisa){
               isadministator(ev,bisa);
	        },function(err){
            console.log(err.code);
	        	statuslog = false;
	        });

	   	 }
   	  }
   };

   $scope.enterLogin=function(ev){
   	 if(!statuslog){
         if($scope.selectedItem == null){
             ToastUtils.showSimpleToast("Pilih wilayah kotama!!",null);
             return;
         }

   	 	if($scope.datalogin.email && $scope.datalogin.password && ($scope.selectedItem != null)){
   	 		statuslog=true;
   	 		var spiner = DialogUtils.createProgress();
   	 		spiner.setColor('#FFEB3B');
   	 		spiner.start();
   	 		DBAuthHelper.loginUsers(auth,$scope.datalogin).then(function(bisa){
   	 			spiner.complete();
	          	isadministator(ev,bisa);
	        },function(err){
	        	spiner.reset();
	        	statuslog=false;
	        	ErorException.checkError(ev,err.code);
	        });
   		}else{
            ToastUtils.showSimpleToast("Isi semua inputan!!",null);
         }
   	 }
   	};

   	$scope.showResetPassword=function(ev){
   		var tmp = {};
		tmp.title = "Atur ulang kata sandi";
		tmp.content= "Masukkan alamat email,kata sandi akan dikirimkan melalui alamat email.";
		tmp.placeholder= "email";
		tmp.label = "atur ulang kata sandi";
		tmp.initialValue= null;

   		DialogUtils.showPrompt(ev,tmp).then(function(result){
   			statuslog = true;
   			var tmp = {};
   			tmp.email = result;
   			var spiner = DialogUtils.createProgress();
   	 		spiner.setColor('#FFEB3B');
   	 		spiner.start();
   			DBAuthHelper.resetPassword(DBAuthHelper.getAuth(),tmp).then(function(result){
   				spiner.complete();
   				var tmps = {};
   				tmps.title = "Berhasil";
   				tmps.content = "Kata sandi berhasil direset,periksa alamat email anda untuk melanjutkan.";
   				DialogUtils.showAlert(ev,tmps);
   				statuslog=false;
   			},function(err){
   				spiner.reset();
   				statuslog=false;
   				console.log(err.code);
   				ErorException.checkError(ev,err.code);
   			});
   		});
   	};

}]);