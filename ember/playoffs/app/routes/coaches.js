import Route from '@ember/routing/route';

export default Route.extend({
    model() {
        return [{
          id: 'lightning-coach',
          name: 'Jon Cooper',
          team: 'Tampa Bay Lightning',
          start: 'March 25, 2013',
          image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Crane_estate_(5).jpg',
        },{
          id: 'flames-coach',
          name: 'Bill Peters',
          team: 'Calgary Flames',
          start: 'April 23, 2018',
          image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Crane_estate_(5).jpg',
        }, {
          id: 'sharks-coach',
          name: 'Peter DeBoer',
          team: 'San Jose Sharks',
          start: 'May 28, 2015',
          image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Crane_estate_(5).jpg',
        }, {
          id: 'jets-coach',
          name: 'Paul Maurice',
          team: 'Winnipeg Jets',
          start: 'January 12, 2014',
          image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Crane_estate_(5).jpg',
        }, {
          id: 'bruins-coach',
          name: 'Bruce Cassidy',
          team: 'Boston Bruins',
          start: 'February 7, 2017',
          image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Crane_estate_(5).jpg',
        }, {
          id: 'oilers-coach',
          name: 'Ken Hitchcock',
          team: 'Edmonton Oilers',
          start: 'November 20, 2018',
          image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Crane_estate_(5).jpg',
        }];
      }
});
