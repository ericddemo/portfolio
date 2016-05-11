angular.module('demoApp')
  .factory('demoService', function ($http) {
  
  var demoService = {};
  
  demoService.getBlurayList = function(){
    return $http.get('/turbo/l_bluray_library.p_bluray_json').then(function(res){
      demoService.blurayList = res.data;
      return demoService.blurayList;
    });
  };
  
  demoService.updateUserSettings = function(settings){
    return $http.post('/api/user/settings/',settings);
  };
  
  return demoService;
});