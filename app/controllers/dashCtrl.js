app.controller('dashCtrl', ['$scope','SideNavUtils','MenuUtils','currentAuth','DBAuthHelper','$state','DialogUtils','$rootScope','RestDB','$timeout','$http','Notify',function ($scope,SideNavUtils,MenuUtils,currentAuth,DBAuthHelper,$state,DialogUtils,$rootScope,RestDB,$timeout,$http,Notify) {
    function cekExpires(){
      var nowDate = new Date(),expDate = new Date(currentAuth.expires * 1000),expTimeLeft= Math.floor((expDate.getTime() - (new Date().getTime()))/1000);
   
      if(expTimeLeft < 0 || (localStorage.getItem('idk') == null)){
        DBAuthHelper.getAuth().$unauth();
        $state.go('login');
      }
    };
    //init

    var fb = RestDB.getFirebase("distribusi");
    fb.on('child_added', function(snapShot,prevKey) {
     if(snapShot.val().id_ktm == localStorage.getItem('idk') && snapShot.val().status == 0){
        Notify.makenotify(null,"Pengiriman alusista","Perminataan logistik diterima,dan barang sedang dikirim!");
      }
      
    });


    /**
    *inisialisasi boolean
    */

    $scope.isKotamaOpen = false;
    $scope.isInventarisOpen = false;
    $scope.isPermintaanOpen= false;

     $scope.isDistribusiOpen= false;

    cekExpires();
    $scope.showSearch = false;
    $rootScope.currentAdmin = {};
    var isopen = false;
    DBAuthHelper.isAdministrator(currentAuth.uid).then(function(result){
            $rootScope.currentAdmin.id = currentAuth.uid;
            $rootScope.currentAdmin.email = result.email;
            $rootScope.currentAdmin.name = result.ur_ktm;
     
            if(result.image){
                $rootScope.currentAdmin.image = result.image;
            }
          
    });


    $scope.dashtitile = "DashBoard";
    $scope.toggleLeft = SideNavUtils.buildToggle('left');
    $scope.openMenu=function($mdOpenMenu,ev){
      return MenuUtils.openMenu($mdOpenMenu,ev);
    };
    $scope.setTitle=function(title){
      $scope.dashtitile = title;
    };  

    /*
      menu
    */
     $http.get('app/data/fungsilogistik.json').success(function(data) {
       $scope.listFungsiLogistik = data.fungsilogistik;   
     });

     $http.get('app/data/kotama.json').success(function(data) {
       $scope.listKotama = data.kotama;   
    });

  
      $http.get('app/data/jenislogistik.json').success(function(data) {
       $scope.listJenisLogistik = data.jenislogistik;   
     });

    $scope.openProfile=function(ev){
      var congif = {};
      congif.controller = "DialogProfiletCtrl";
      congif.template = "view/dialog/dialogprofile.html";
      DialogUtils.showCustomDialog(ev,congif);
    };

    $scope.logOutApp=function(){
      localStorage.removeItem("idk");
      DBAuthHelper.getAuth().$unauth();
      $state.go('login');
    };

    /**
    * getterController
    */

    $scope.getKotamaList=function(){ // get kotama
      if(!$scope.isKotamaOpen){
        $scope.listKotama  = RestDB.getArray('operasi/kotama');
        $timeout(function(){
          $scope.isKotamaOpen = true;
        },1000); 
      }
    };

    $scope.getInventorisList=function(){// get inventoris
      if(!$scope.isInventarisOpen){
        $scope.listInventori = RestDB.getArray("operasi/kotama/"+localStorage.getItem('idk')+"/inventoris");
        $timeout(function(){
          $scope.isInventarisOpen = true;
        },1000); 
      }
    };

    $scope.getPermintaanList=function(){ // kotama request data
      if(!$scope.isPermintaanOpen){
        $scope.listPermintaan = RestDB.getArray('inventori/permintaan');
        $timeout(function(){
          $scope.isPermintaanOpen = true;
        },1000); 
      }
    };

    $scope.getDistribusiList=function(){
         if(!$scope.isDistribusiOpen){
            $scope.listDistribusi = RestDB.getArray('distribusi');
            $timeout(function(){
              $scope.isDistribusiOpen = true;
            },1000); 
          }
    };

      $scope.getDistribusiList();
      $scope.getPermintaanList();

     $scope.getRequestLength=function(){
      var t = 0;
       for (var i = 0; i < $scope.listPermintaan.length; i++) {
         if($scope.listPermintaan[i].from == localStorage.getItem('idk') && ($scope.listPermintaan[i].status == 0)){
          t++;
         }
       };
       return t;
     };

     $scope.getJenisById=function(id){
      for (var i = $scope.listJenisLogistik.length - 1; i >= 0; i--) {
        if($scope.listJenisLogistik[i].id == id){
            return $scope.listJenisLogistik[i];
        }
      };
      return "tidak diketahui";
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
        if(!time){
          return null;
        }
        return fd;
      };

      $scope.getKotamaById=function(id){
        for (var i = $scope.listKotama.length - 1; i >= 0; i--) {
          if($scope.listKotama[i].kd_ktm == id){
            return $scope.listKotama[i].ur_ktm;
          }
        };
        return "tidak diketahui";
      };


    $scope.getDistributionLength=function(){
      var l=0;
      for (var i = $scope.listDistribusi.length - 1; i >= 0; i--) {
        if($scope.listDistribusi[i].id_ktm == localStorage.getItem('idk') && ($scope.listDistribusi[i].status == 0)){
          l++;
        }

      };
      return l;
    };

}])


.controller('LeftCtrl',[ '$scope','$state',function ($scope,$state) {
    $scope.goTopAnotherPage=function(page){
      $state.go(page);
    };
 }])

.controller('DialogProfiletCtrl',[ '$scope','$rootScope','DialogUtils','RestDB','ToastUtils','DBAuthHelper','ErorException','$state','$timeout','$base64',function ($scope,$rootScope,DialogUtils,RestDB,ToastUtils,DBAuthHelper,ErorException,$state,$timeout,$base64) {
    $scope.profileadmin = $rootScope.currentAdmin;
    $scope.update = {};
    $scope.statusprofile = "administrator";

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
           var url = "operasi/kotama/"+localStorage.getItem('idk');
           RestDB.updateData(url,tmp).then(function(res){
            $scope.profileadmin.image = img;
            $rootScope.currentAdmin.image = img;
           });
       }else{
       
       }
     
    };

    /*
    * delete image
    */

    $scope.deleteImage=function(){
      var url = "operasi/kotama/"+localStorage.getItem('idk')+"/image";
      if($scope.profileadmin.image){
              RestDB.removeData(url).then(function(res){
              console.log('image removed');
              $scope.profileadmin.image = null;
              $rootScope.currentAdmin.image = null;
              $scope.cancel();
              ToastUtils.showSimpleToast("Gambar berhasil dhapus!",null);
            });
      }
      else{
        ToastUtils.showSimpleToast("Gambar sudah kosong!",null);
      }
    };

    /*
    *update name
    */
    $scope.openUpdateName=function(ev){
        var tmp = {};
        tmp.title = "Update Name";
        tmp.content= "Enter your name.";
        tmp.placeholder= "name";
        tmp.label = "update name";

        DialogUtils.showPrompt(ev,tmp).then(function(result){
          var tmp = {};
          tmp.name = result;
          var url = "admin/"+$scope.profileadmin.id;
          var spiner = DialogUtils.createProgress();
          spiner.setColor('#FFEB3B');
          spiner.start();
           RestDB.updateData(url,tmp).then(function(res){
            spiner.complete();
            $rootScope.currentAdmin.name = result;
            $scope.profileadmin.name=result;
            ToastUtils.showSimpleToast("Name Updated!",null);
           });
          
        });
    };

    /*
    * update email
    */

    $scope.updatingEmail=function(ev){
      $scope.update.oldEmail = $rootScope.currentAdmin.email;
      var spiner = DialogUtils.createProgress();
      spiner.setColor('#FFEB3B');
      spiner.start();
      DBAuthHelper.changeEmail(DBAuthHelper.getAuth(),$scope.update).then(function(bisa){
        spiner.complete();
        $scope.cancel();

           var tmp = {};
           var url = "operasi/kotama/"+localStorage.getItem('idk');
           tmp.email = $scope.update.newEmail;
           RestDB.updateData(url,tmp).then(function(res){
            
              ToastUtils.showSimpleToast("Email berhasil diperbarui!",null);
    
              $rootScope.currentAdmin.email = $scope.update.newEmail;
              $scope.profileadmin.email = $scope.update.newEmail;
              $timeout(function(){
                 DBAuthHelper.getAuth().$unauth();
                $state.go('login');
              },1000);

           });
 
      },function(error){
        spiner.reset();
         ErorException.checkError(ev,error.code);
      });
    };

    $scope.openupdateEmail=function (ev) {
      var congif = {};
      congif.controller = "DialogProfiletCtrl";
      congif.template = "view/dialog/changeEmail.html";
      DialogUtils.showCustomDialog(ev,congif);
    };

    /*
    *updating password
    */

    $scope.updatingPassword=function(ev){
      $scope.update.email = $rootScope.currentAdmin.email;
      var spiner = DialogUtils.createProgress();
      spiner.setColor('#FFEB3B');
      spiner.start();
      DBAuthHelper.changePassword(DBAuthHelper.getAuth(),$scope.update).then(function(bisa){
        spiner.complete();
        $scope.cancel();

           var tmp = {};
           var url = "operasi/kotama/"+localStorage.getItem('idk');
           tmp.password = $base64.encode($scope.update.newPassword);
           RestDB.updateData(url,tmp).then(function(res){
                ToastUtils.showSimpleToast("Kata sandi diperbarui",null);
           });
    
        
      },function(error){
        spiner.reset();
         ErorException.checkError(ev,error.code);
      });
    };

    $scope.openupdatepassword=function(ev){
      var congif = {};
      congif.controller = "DialogProfiletCtrl";
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
        tmp.email = $rootScope.currentAdmin.email;
        var spiner = DialogUtils.createProgress();
        spiner.setColor('#FFEB3B');
        spiner.start();
        DBAuthHelper.resetPassword(DBAuthHelper.getAuth(),tmp).then(function(result){
          spiner.complete();
          var tmps = {};
          tmps.title = "Berhasil";
          tmps.content = "Kata sandi berhasil di reset,periksa alamat email anda untuk melanjutkan.";
          DialogUtils.showAlert(ev,tmps);
        },function(err){
          spiner.reset();
          console.log(err.code);
          ErorException.checkError(ev,err.code);
        });
    };
 }]);