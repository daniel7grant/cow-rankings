import './theme.scss';
import http from 'axios';

document.addEventListener('DOMContentLoaded', function () {

	http.get('http://rankings.danielgrants.com/api/stageweek').then((response) =>{
		document.getElementById('stageweek').innerHTML = 'Stage ' + response.data.stage + ' Week ' + response.data.week;
	});

});