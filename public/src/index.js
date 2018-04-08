import Sortable from 'sortablejs';
import http from 'axios';
import groupBy from 'lodash/groupBy';
import find from 'lodash/find';
import flatten from 'lodash/flatten';
import map from 'lodash/map';
import orderBy from 'lodash/orderBy';
import TeamsTemplate from './teamstemplate.hbs';
import MvpTemplate from './mvptemplate.hbs';
import './theme.scss'; 

var teamsdata;

document.addEventListener('DOMContentLoaded', function () {

	http.get('http://rankings.danielgrants.com/api/stageweek').then((response) =>{
		document.getElementById('stageweek').innerHTML = 'Stage ' + response.data.stage + ' Week ' + response.data.week;
	});

	http.get('https://api.overwatchleague.com/teams').then((response) => {
		teamsdata = orderBy(map(response.data.competitors, (team) => {
			return {
				abbreviatedName: team.competitor.abbreviatedName,
				name: team.competitor.name,
				icon: team.competitor.icon,
				players: map(team.competitor.players, (player) => {
					return {
						player_number: player.player.attributes.player_number,
						position: player.player.attributes.role,
						familyName: player.player.familyName,
						givenName: player.player.givenName,
						headshot: player.player.headshot,
						name: player.player.name,
						nationality: player.player.nationality,
						team: team.competitor.abbreviatedName,
						primaryColor: colorFix(team.competitor).primaryColor,
						secondaryColor: colorFix(team.competitor).secondaryColor
					};
				}),
				primaryColor: colorFix(team.competitor).primaryColor,
				secondaryColor: colorFix(team.competitor).secondaryColor
			};
		}), 'name');

		document.getElementById('teams-sortable').innerHTML = TeamsTemplate({ teams: teamsdata });
		Sortable.create(document.getElementById('teams-sortable'), { animation: 150 });

		let players = groupBy(orderBy(flatten(map(teamsdata, (team)=>{
			return team.players;
		})),(player) => player.name.toLowerCase()), 'position');

		document.getElementById('mvps').innerHTML = MvpTemplate(players);

		document.getElementById('container').classList.remove('loading');

	}).catch((error) => {
		console.log(error);
	});
});

function colorFix(team){
	if(team.abbreviatedName === 'GLA')
	{
		return {
			primaryColor : team.primaryColor,
			secondaryColor : 'FFFFFF'
		}
	}
	else if(team.abbreviatedName === 'SFS'){
		return {
			primaryColor : team.primaryColor,
			secondaryColor : 'FFFFFF'
		}
	}
	else if(team.abbreviatedName === 'LDN'){
		return {
			primaryColor : team.primaryColor,
			secondaryColor : '38889c'
		}
	}
	return {
		primaryColor : team.primaryColor,
		secondaryColor : team.secondaryColor
	}
}