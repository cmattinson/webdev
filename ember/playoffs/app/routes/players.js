import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return [{
      id: 'lightning-scorer',
      name: 'Nikita Kucherov',
      team: 'Tampa Bay Lightning',
      points: "119",
      image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Crane_estate_(5).jpg',
    },{
      id: 'flames-scorer',
      name: 'Johnny Gaudreau',
      team: 'Calgary Flames',
      points: "92",
      image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Crane_estate_(5).jpg',
    }, {
      id: 'sharks-scorer',
      name: 'Brent Burns',
      team: 'San Jose Sharks',
      points: "75",
      image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Crane_estate_(5).jpg',
    }, {
      id: 'jets-scorer',
      name: 'Blake Wheeler',
      team: 'Winnipeg Jets',
      points: "88",
      image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Crane_estate_(5).jpg',
    }, {
      id: 'bruins-scorer',
      name: 'Brad Marchand',
      team: 'Boston Bruins',
      points: "87",
      image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Crane_estate_(5).jpg',
    }, {
      id: 'oilers-scorer',
      name: 'Connor McDavid',
      team: 'Edmonton Oilers',
      points: "105",
      image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Crane_estate_(5).jpg',
    }];
  }
});
