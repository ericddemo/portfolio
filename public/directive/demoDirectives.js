demoApp.directive('genreColor', function(){
    return function(scope, element, attrs){
        attrs.$observe('genreColor', function(genre) {
          //intitiate d3 color scale
          var color = d3.scale.category10();
          //set domain of scale so colors can be reliably referenced by name
          var domain = ["Comedy", "Sci-fi", "Animated", "Drama", "Horror", "Romance", "Action"];
          domain = domain.sort();
          color.domain(domain);
            element.css({
                'color': color(genre)
            });
        });
    };
});

demoApp.directive('ratingIcon', function(){
    return function(scope, element, attrs){
        attrs.$observe('ratingIcon', function(rating) {
          if(rating > 6){
            element.removeClass('fa-thumbs-down').addClass('fa-thumbs-up');
            element.css({
                'color': 'green'
            });
          } else {
            element.removeClass('fa-thumbs-up').addClass('fa-thumbs-down');
            element.css({
                'color': 'red'
            });
          }
        });
    };
});