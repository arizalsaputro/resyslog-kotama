app.controller('permintaanCtrl',['$scope','DialogUtils','$rootScope',function ($scope,DialogUtils,$rootScope) {
    	$scope.setTitle("Permintaan"); 
    	$scope.getPermintaanList();

    	$scope.openAddnewMember=function(ev){
    		  var congif = {};
		      congif.controller = "newmemberCtrl";
		      congif.template = "view/dialog/addnewmember.html";
		      DialogUtils.showCustomDialog(ev,congif);
    	};


    	$scope.openProfileMember=function(ev,member){
    		  $rootScope.tmpmember = member;
    		  var congif = {};
		      congif.controller = "profileMember";
		      congif.template = "view/dialog/dialogprofile.html";
		      DialogUtils.showCustomDialog(ev,congif);
    	};

    	$scope.isnomember=function(){
    		if($scope.getmembesisopen && $scope.listMember[0] == null){
    			return true;
    		}
    		else{
    			return false;
    		}
    	};

      $scope.openPermintaanDialog=function(ev){
        var congif = {};
        congif.controller = "newRequest";
        congif.template = "view/dialog/addnewrequest.html";
        DialogUtils.showCustomDialog(ev,congif);
      };

      $scope.getStatus = function(status){
        switch(status){
          case 0 :
            return "belum di proses";break;
          case 1 : 
            return "sudah di proses";break;
          case 2 : 
            return  "permintaan ditolak";break;
        }   
      };
      $scope.cekisThisRequest=function(id){
        if(id == localStorage.getItem('idk')){
          return true;
        }
        return false;
      };
    	
      $scope.getFunctionById=function(id){
        for (var i = $scope.listFungsiLogistik.length - 1; i >= 0; i--) {
          if($scope.listFungsiLogistik[i].id == id){
            return $scope.listFungsiLogistik[i].namaFungsi;
          }
        };
        return "tidak diktahui";
      };

      $scope.getDatebyTimeStamp=function(time){
        var d = new Date(time);
        var fd = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
        return fd;
      };

      var nomor = [0,0,0];

      $scope.getNomor=function(pil){
        return ++nomor[pil];
      };

}]);

app.controller('newRequest',['$scope','DialogUtils','$rootScope','RestDB','ToastUtils','ErorException','DBAuthHelper','$base64','$http',function ($scope,DialogUtils,$rootScope,RestDB,ToastUtils,ErorException,DBAuthHelper,$base64,$http) {
     $scope.cancel=function(){
      DialogUtils.cancel();
    };
    $scope.hide=function(){
      DialogUtils.hide();
    };
    $scope.darurat = false;
    $scope.isChecked=function(){
      return $scope.darurat;
    };  

    $scope.isDisabled = false;
    $scope.isNoCache = false;
    $scope.searchTextFungsi = "";
     $scope.searchTextJenis = "";
    $scope.selectedItem = null;
     $scope.selectedJenisItem = null;
     $scope.catatan = null;

    $http.get('app/data/jenislogistik.json').success(function(data) {
       $scope.listJenisLogistik = data.jenislogistik;
    });

    $scope.jumlah = null;

    $scope.onItemSelectedJenis=function(item){
      $scope.selectedJenisItem = item;
    };


    $scope.sendRequest = function(){
     
      if($scope.selectedJenisItem == null){
        ToastUtils.showSimpleToast("Masukkan jenis alusista",null);
        return;
      }
      if($scope.jumlah == null || $scope.jumlah == 0){
        ToastUtils.showSimpleToast("Masukkan jumlah alusista",null);
        return;
      }

      if($scope.jumlah != null  && $scope.selectedJenisItem != null){
          var spiner = DialogUtils.createProgress();
          spiner.setColor('#FFEB3B');
          spiner.start();

        var ob = RestDB.getFirebase("inventori/permintaan");
        ob.push({
          'from' : localStorage.getItem('idk'), 
          'jenis' : $scope.selectedJenisItem,
          'jumlah' : $scope.jumlah,
          'status' : 0,
          'darurat' : $scope.darurat,
          'catatan' : $scope.catatan,
          'time' : Firebase.ServerValue.TIMESTAMP
        });
        spiner.complete();
        ToastUtils.showSimpleToast("Permintaan berhasil dikirim",null);
        $scope.cancel();
      }
    };



}]);


app.controller('profileMember',['$scope','DialogUtils','$rootScope','RestDB','ToastUtils','ErorException','DBAuthHelper','$base64',function ($scope,DialogUtils,$rootScope,RestDB,ToastUtils,ErorException,DBAuthHelper,$base64) {
    $scope.profileadmin = $rootScope.tmpmember;
    $scope.profileadmin.id = $rootScope.tmpmember.$id;
    $scope.update = {};
    $scope.statusprofile = "member";

    $scope.cancel=function(){
      DialogUtils.cancel();
    };
    $scope.hide=function(){
      DialogUtils.hide();
    };

    /*
    *updating profile
    *create-read-update-delete
    */
    $scope.uploadimage=function(img){
       var tmp = {};
       if(!img.name){
           tmp.image = img;
           var url = "members/"+$scope.profileadmin.id;
           RestDB.updateData(url,tmp).then(function(res){
            $scope.profileadmin.image = img;
           });
       }else{
        console.log('no ');
       }
     
    };

    /*
    * delete image
    */

    $scope.deleteImage=function(){
      var url = "members/"+$scope.profileadmin.id+"/image";
      if($scope.profileadmin.image){
              RestDB.removeData(url).then(function(res){
              console.log('image removed');
              $scope.profileadmin.image = null;
              $scope.cancel();
              ToastUtils.showSimpleToast("Image Deleted!",null);
            });
      }
      else{
        ToastUtils.showSimpleToast("Image Already Deleted!",null);
      }
    };

    /*
    *update name
    */
    $scope.openUpdateName=function(ev){
        var tmp = {};
        tmp.title = "Update Name";
        tmp.content= "Enter new name.";
        tmp.placeholder= "name";
        tmp.label = "update name";

        DialogUtils.showPrompt(ev,tmp).then(function(result){
          var tmp = {};
          tmp.name = result;
          var url = "members/"+$scope.profileadmin.id;
          var spiner = DialogUtils.createProgress();
          spiner.setColor('#FFEB3B');
          spiner.start();
           RestDB.updateData(url,tmp).then(function(res){
            spiner.complete();
            $scope.profileadmin.name=result;
            ToastUtils.showSimpleToast("Name Updated!",null);
           });
          
        });
    };

    /*
    *update phone
    */

    $scope.openUpdatePhone=function(ev){
    	var tmp = {};
        tmp.title = "Update Phone";
        tmp.content= "Enter new phone number.";
        tmp.placeholder= "phone";
        tmp.label = "update phone";

        DialogUtils.showPrompt(ev,tmp).then(function(result){
          var tmp = {};
          tmp.phone = result;
          var url = "members/"+$scope.profileadmin.id;
          var spiner = DialogUtils.createProgress();
          spiner.setColor('#FFEB3B');
          spiner.start();
           RestDB.updateData(url,tmp).then(function(res){
            spiner.complete();
            $scope.profileadmin.phone=result;
            ToastUtils.showSimpleToast("Phone Number Updated!",null);
           });
          
        });
    };

    /*
	*update address
	*/

	$scope.openUpdateAddres=function(ev){
		var tmp = {};
        tmp.title = "Update Address";
        tmp.content= "Enter new address.";
        tmp.placeholder= "address";
        tmp.label = "update address";

        DialogUtils.showPrompt(ev,tmp).then(function(result){
          var tmp = {};
          tmp.address = result;
          var url = "members/"+$scope.profileadmin.id;
          var spiner = DialogUtils.createProgress();
          spiner.setColor('#FFEB3B');
          spiner.start();
           RestDB.updateData(url,tmp).then(function(res){
            spiner.complete();
            $scope.profileadmin.address=result;
            ToastUtils.showSimpleToast("Address Updated!",null);
           });
          
        });
	};

    /*
    * update email
    */

    $scope.updatingEmail=function(ev){
      $scope.update.oldEmail = $rootScope.tmpmember.email;
      var spiner = DialogUtils.createProgress();
      spiner.setColor('#FFEB3B');
      spiner.start();
      DBAuthHelper.changeEmail(DBAuthHelper.getAuth(),$scope.update).then(function(bisa){
        spiner.complete();
        $scope.cancel();
        ToastUtils.showSimpleToast("Email Updated!",null);
        $scope.profileadmin.email = $scope.update.newEmail;       
      },function(error){
        spiner.reset();
         ErorException.checkError(ev,error.code);
      });
    };

    $scope.openupdateEmail=function (ev) {
      var congif = {};
      congif.controller = "profileMember";
      congif.template = "view/dialog/changeEmail.html";
      DialogUtils.showCustomDialog(ev,congif);
    };

    /*
    *updating password
    */

    $scope.updatingPassword=function(ev){
      $scope.update.email = $rootScope.tmpmember.email;
      var spiner = DialogUtils.createProgress();
      spiner.setColor('#FFEB3B');
      spiner.start();
      DBAuthHelper.changePassword(DBAuthHelper.getAuth(),$scope.update).then(function(bisa){
        spiner.complete();
        $scope.cancel();
        ToastUtils.showSimpleToast("Password Updated!",null);
        
      },function(error){
        spiner.reset();
         ErorException.checkError(ev,error.code);
      });
    };

    $scope.openupdatepassword=function(ev){
      var congif = {};
      congif.controller = "profileMember";
      congif.template = "view/dialog/changepassword.html";
      DialogUtils.showCustomDialog(ev,congif);
    };

    $scope.upload = function () {
      document.querySelector('#fileInput').click();
    };

    /*
    * reset password
    */

    $scope.resetPassword=function(ev){
        var tmp = {};
        tmp.email = $rootScope.tmpmember.email;
        var spiner = DialogUtils.createProgress();
        spiner.setColor('#FFEB3B');
        spiner.start();
        DBAuthHelper.resetPassword(DBAuthHelper.getAuth(),tmp).then(function(result){
          spiner.complete();
          var tmps = {};
          tmps.title = "Success";
          tmps.content = "Password successfully reset.Check your email address to continue.";
          DialogUtils.showAlert(ev,tmps);
        },function(err){
          spiner.reset();
          console.log(err.code);
          ErorException.checkError(ev,err.code);
        });
    };

    /*
    *delete account
    */

    $scope.deleteAccount=function(ev){
    	var tmp = {};
    	tmp.title = "Delete Account";
        tmp.content= "are you sure want to delete this account ? this will deleted permanenly.";
        tmp.label = "update address";

        
        DialogUtils.showConfirm(ev,tmp).then(function(bisa){
        	if(bisa){
        		var del = {};
        		del.email = $rootScope.tmpmember.email;
        		del.password = $base64.decode( $rootScope.tmpmember.password);
        		 var spiner = DialogUtils.createProgress();
		        spiner.setColor('#FFEB3B');
		        spiner.start();
        		DBAuthHelper.removeUser(DBAuthHelper.getAuth(),del).then(function(bisa){
        			var url = "members/"+$rootScope.tmpmember.$id;
        			RestDB.removeData(url).then(function(bisa){
        				spiner.complete();
        				ToastUtils.showSimpleToast("Account Removed!",null);
        			});
        		},function(error){
        			spiner.reset();
        			ErorException.checkError(ev,error.code);
        		});
        	}
        });
    };
}]);


app.controller('newmemberCtrl',['$scope','DialogUtils','DBAuthHelper','ToastUtils','$base64','ErorException','RestDB',function ($scope,DialogUtils,DBAuthHelper,ToastUtils,$base64,ErorException,RestDB) {
	 	$scope.newmember = {};

	 $scope.cancel=function(){
  		DialogUtils.cancel();
    };

    $scope.uploadimage=function(img){
       var tmp = {};
       if(!img.name){
           $scope.newmember.image = img;
       }else{
        console.log('no ');
       }
     
    };

    $scope.addnewMember = function(ev){
    	if($scope.newmember.name && $scope.newmember.email && $scope.newmember.phone && $scope.newmember.address && $scope.newmember.password){
    		 var spiner = DialogUtils.createProgress();
		     spiner.setColor('#FFEB3B');
		        spiner.start();
    		DBAuthHelper.createUsers(DBAuthHelper.getAuth(),$scope.newmember).then(function(bisa){
    			$scope.newmember.password = $base64.encode($scope.newmember.password);
    			var url = "members/"+bisa.uid;
		         spiner.complete();
		          spiner.start();
    			RestDB.saveData(url,$scope.newmember).then(function(bisa){
    				spiner.complete();
    				$scope.cancel();
    				ToastUtils.showSimpleToast("New member added!",null);
    			});

    		},function(error){
    			spiner.reset();
    			ErorException.checkError(ev,error.code);
    		});
    	}else{
    		ToastUtils.showSimpleToast("Fill all require!",null);
    	}
    };

     $scope.upload = function () {
      document.querySelector('#fileInput').click();
    };
}]);	


  