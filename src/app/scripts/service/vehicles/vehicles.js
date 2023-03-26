import { METHODS } from '../../constants/method-constants';
import { api, childrenGroups, loggedInUser, loggedInUserVehicles, mainParentAccessToken, setLoggedInUserVehicles } from '../../core/core-variables';
import { ajaxFetch } from '../ajax/ajax-helper';
import { getBaseLogmasterAPIURL } from '../api/services';

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
        syncAllGeotabVehiclesToLogmaster();
        //callbackFunction();
    }, function (err) {
        console.log('error in vehicle fetch', err);
    });
};

export async function syncAllGeotabVehiclesToLogmaster() {
    console.log('start syncing vehicles to logmaster');
    try {
        let response = await ajaxFetch(METHODS.POST, getBaseLogmasterAPIURL() + '/vehicle/create-multiple', loggedInUserVehicles, mainParentAccessToken);
    } catch (error) {
        console.log('error syncing vehicles to logmaster', error);
    }
};