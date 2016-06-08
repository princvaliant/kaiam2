/**
 * @ngdoc directive
 * @name samePassword
 * @restrict A
 * @scope
 *
 * @description
 * `samePassword` is a directive with the purpose to validate a password input based on the value of another input.
 * When both input values are the same the inputs will be set to valid
 *
 * @usage
 * ```html
 * <form name="signup">
 *     <input name="password" type="password" ng-model="user.password" same-password="signup.confirm" />
 *     <input name="confirm" type="password" ng-model="user.confirm" same-password="signup.confirm" />
 * </form>
 * ```
 */
angular.module('kaiamAuthentication').directive('samePassword', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      samePassword: '='
    },
    link: function (scope, element, attrs, ngModel) {
      ngModel.$viewChangeListeners.push(function () {
        ngModel.$setValidity('samePassword', scope.samePassword.$modelValue === ngModel.$modelValue);
        scope.samePassword.$setValidity('samePassword', scope.samePassword.$modelValue === ngModel.$modelValue);
      });
    }
  };
});
