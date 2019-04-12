var camParkingSpots = JSON.parse(req.body.status);                                      // Get all parking spots as JSON object from camera's request
var masterParkingSpots = JSON.parse(parkinglot.status);                                        // Get all parking spots as JSON object from masterfile object
for (var i = 0; i < camParkingSpots.length; i++) {                                      // For all camera parking spots compare against 
    var camParkingSpace = camParkingSpots[i];
    for (var j = 0; j < masterParkingSpots.length; j++) {
        var masterParkingSpace = masterParkingSpots[j];
        if (camParkingSpace.id == masterParkingSpace.id) {
            if (camParkingSpace.confidence == 0) {                                      // If camParkingSpace confidence status == 0, update
                masterParkingSpots[j].confidence = camParkingSpace.confidence;
                break;
            } else if (camParkingSpace.confidence > masterParkingSpace.confidence) {    // If camParkingSpace confidence > masterParkingSpace confidence, update
                masterParkingSpots[j].confidence = camParkingSpace.confidence;
                break;
            } else {                                                                    // If camParkingSpace confidence < masterParkingSpace confidence, do not update
                break;
            }
        }
    }
}

parkinglot.status = JSON.stringify(masterParkingSpots);                                        // Turn array back to string and update lot.status then save
parkinglot.save();