import { METHODS } from '../../constants/method-constants';
import { api, childrenGroups, loggedInUser, loggedInUserVehicles, mainParentAccessToken, setLoggedInUserVehicles } from '../../core/core-variables';
import { ajaxInit } from '../ajax/ajax-helper';
import { getBaseLogmasterAPIURL } from '../api/services';
import { displayLogmasterUILastStep } from '../ui/ui-service';

export function getAllGeotabVehicles() {
    api.call('Get', {
        typeName: 'Device',
        search: {
            groups: childrenGroups
        }
    }, function (fetchedVehicles) {
        //before adding get all existing vehicles of entityId
        //if vehicle plate number is already in 
        setLoggedInUserVehicles(fetchedVehicles.map (function (vehicle)  {
            return {
                vehiclePlate: vehicle.licensePlate,
                VIN: vehicle.vehicleIdentificationNumber,
                comments: vehicle.comment,
                fleetId: vehicle.id,
                externalEntityId: loggedInUser.id
            }
        }));
        //window.sessionStorage.loggedInUserVehicles = JSON.stringify(loggedInUserVehicles);
        //console.log('vehicle session storage', JSON.parse(window.sessionStorage.loggedInUserVehicles));
        console.log('loggedInUserVehicles', loggedInUserVehicles);
        syncAllGeotabVehiclesToLogmaster();
        //callbackFunction();
    }, function (err) {
        console.log('error in vehicle fetch', err);
    });
};

export function syncAllGeotabVehiclesToLogmaster() {
    console.log('start syncing vehicles to logmaster')
    ajaxInit (METHODS.POST, getBaseLogmasterAPIURL() + '/vehicle/create-multiple', 
        function () {
            //onload
            console.log(this.response.message);
        },
        function () {
            //onerror
            console.log('error syncing vehicles to logmaster', this.response);
        },
        mainParentAccessToken)
        .send(JSON.stringify(loggedInUserVehicles));
};