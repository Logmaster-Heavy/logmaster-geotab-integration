import { METHODS } from '../../constants/method-constants';
import {
  api,
  childrenGroups,
  loggedInUser,
  loggedInUserVehicles,
  mainParentAccessToken,
  setLoggedInUserVehicles,
} from '../../core/core-variables';
import { ajaxFetch } from '../ajax/ajax-helper';
import { getBaseLogmasterAPIURL } from '../api/services';

export async function syncGeotabVehiclesToLogmaster() {
  api.call(
    'Get',
    {
      typeName: 'Device',
      search: {
        groups: childrenGroups,
      },
    },
    async function (fetchedVehicles) {
      try {
        setLoggedInUserVehicles(
          fetchedVehicles.map((vehicle) => {
            const {licensePlate, vehicleIdentificationNumber, comment, serialNumber} = vehicle;
            return {
              vehiclePlate: licensePlate,
              VIN: vehicleIdentificationNumber,
              comments: comment,
              fleetId: serialNumber,
              externalEntityId: loggedInUser.id,
            };
          })
        );
        await ajaxFetch(
          METHODS.POST,
          getBaseLogmasterAPIURL() + '/vehicle/create-multiple',
          loggedInUserVehicles,
          mainParentAccessToken
        );
        console.log('vehicles sync completed');
      } catch (error) {
        console.log('syncGeotabVehiclesToLogmaster: error syncing vehicles to logmaster', error);
      }
    },
    function (err) {
      console.log('error in vehicle fetch', err);
    }
  );
}
