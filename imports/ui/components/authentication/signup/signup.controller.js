/**
 * @ngdoc function
 * @name SignupController
 * @module kaiamAuthentication
 * @kind function
 *
 * @description
 *
 * Handles sending of signup info to api and response
 */
angular.module('kaiamAuthentication')
  .controller('SignupController', ['$scope', '$reactive', '$translate', '$state', '$mdToast', '$location', '$reactive',
    function($scope, $reactive, $translate, $state, $mdToast, $location, $reactive, API_CONFIG) {
      $reactive(this).attach($scope);
      $scope.user = {
        name: '',
        email: '',
        password: '',
        confirm: ''
      };
      // this.autorun(() => {
      //   this.subscribe('companies', () => {
      //     let comps = Companies.find().fetch();
      //     $scope.arr = [];
      //     _.each(comps, (comp) => {
      //       _.each(comp.allowedEmails.split(','), (email) => {
      //         $scope.arr.push({e: email.trim().toLowerCase(), c: comp});
      //       })
      //     });
      //   });
      // });

      $scope.signupClick = function() {
        let ext = $scope.user.email.split('@')[1];
        let comp;
        for (let i in $scope.arr) {
          if ($scope.user.email === $scope.arr[i].e || ext === $scope.arr[i].e) {
            comp = $scope.arr[i].c;
            break;
          }
        }
        if (!comp) {
          $mdToast.show(
              $mdToast.simple()
                  .content('Sign up error - The email address does not match criteria')
                  .position('bottom right')
                  .hideDelay(3000)
          );
          return;
        }

        let role;
        if (comp.isClient) {
          role = 'CUSTOMER_ACCESS';
        } else {
          role = 'DASHBOARD_ACCESS';
        }

        // $meteor.createUser({
        //   username: $scope.user.name,
        //   email: $scope.user.email,
        //   password: $scope.user.password,
        //   profile: {
        //     roles: [role],
        //     company: comp.name,
        //     isClient: comp.isClient
        //   }
        // }).then(function() {
        //   $mdToast.show(
        //     $mdToast.simple()
        //     .content($translate.instant('SIGNUP.MESSAGES.CONFIRM_SENT') + ' ' + $scope.user.email)
        //     .position('top center')
        //     .hideDelay(5000)
        //   );
        //   $scope.user = {};
        // }, function(err) {
        //   if (err.message.indexOf('100002') > 0) {
        //     $mdToast.show(
        //       $mdToast.simple()
        //       .content($translate.instant('SIGNUP.MESSAGES.CONFIRM_SENT') + ' ' + $scope.user.email)
        //       .position('fit')
        //       .hideDelay(5000)
        //     );
        //     $scope.user = {};
        //     $location.path('login');
        //   } else {
        //     $mdToast.show(
        //       $mdToast.simple()
        //       .content('Sign up error - ' + err)
        //       .position('bottom right')
        //       .hideDelay(3000)
        //     );
        //   }
        // });
      };


    }
  ]);
