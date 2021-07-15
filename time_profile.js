/**
 * Copyright 2021 Bart Butenaers
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
 module.exports = function(RED) {
    var settings = RED.settings;

    function TimeProfileNode(config) {
        RED.nodes.createNode(this,config);
        this.outputField        = config.outputField;
        this.command            = config.command;     
        this.timeslotCount      = config.timeslotCount;
        this.timeslotCountType  = config.timeslotCountType;
        this.timeslotLength     = config.timeslotLength;
        this.timeslotLengthType = config.timeslotLengthType;
        this.aggregation        = config.aggregation;
        this.aggregationType    = config.aggregationType;
        this.profile            = config.profile;
        this.profileType        = config.profileType;
        this.switchPoints       = config.switchPoints;
        this.switchPointsType   = config.switchPointsType;
        this.startIndex         = config.startIndex;
        this.startIndexType     = config.startIndexType;
        this.startHour          = config.startHour;
        this.startHourType      = config.startHourType;
        this.startMinute        = config.startMinute;
        this.startMinuteType    = config.startMinuteType;
        this.fixedValue         = config.fixedValue;
        this.fixedValueType     = config.fixedValueType;
        
        var node = this;
        
        function getTimeSlotIndex(startHour, startMinute, timeSlotLength) {
            var seconds = startMinute * 60 + startHour * 3600;           
            return Math.trunc(seconds / timeSlotLength);
        }
        
        node.on("input", function(msg) {
            var input, outputProfile, timeslotLength, profile, switchPoints, startIndex, startHour, startMinute, fixedValue, aggregation;

            var timeslotCount = RED.util.evaluateNodeProperty(node.timeslotCount, node.timeslotCountType, node, msg, null);
            
            if (timeslotCount == undefined || !Number.isInteger(timeslotCount) || timeslotCount < 1) {
                node.error("The timeslotCount should be specified (as a number which is not 0)");
                return;
            }

            if (["schedule_time_profile", "create_time_profile"].includes(node.command)) {
                timeslotLength = RED.util.evaluateNodeProperty(node.timeslotLength, node.timeslotLengthType, node, msg, null);

                if (timeslotLength == undefined || !Number.isInteger(timeslotLength) || timeslotLength < 1) {
                    node.error("The timeslot length should be specified (as a number which is not 0)");
                    return;
                }
            }

            if (["create_index_profile", "create_time_profile"].includes(node.command)) {
                switchPoints = RED.util.evaluateNodeProperty(node.switchPoints, node.switchPointsType, node, msg, null);

                //if (switchPoints == undefined || !Array.isArray(switchPoints)) {
                //    node.error("The switchPoints should be specified an array of numbers");
                //    return;
                //}       
            }

            if (node.command === "schedule_index_profile") {
                startIndex = RED.util.evaluateNodeProperty(node.startIndex, node.startIndexType, node, msg, null);

                if (startIndex == undefined || !Number.isInteger(startIndex) || startIndex < 1) {
                    node.error("The start index should be specified");
                    return;
                }
            }

            if (node.command === "schedule_time_profile") {
                startHour = RED.util.evaluateNodeProperty(node.startHour, node.startHourType, node, msg, null);
                startMinute = RED.util.evaluateNodeProperty(node.startMinute, node.startMinuteType, node, msg, null);

                if (startHour == undefined || !Number.isInteger(startHour) || startHour < 0 || startHour > 23){
                    node.error("The start hour should be specified as a number between 0 and 23");
                    return;
                }
                
                if (startMinute == undefined || !Number.isInteger(startMinute) || startMinute < 0 || startMinute > 59){
                    node.error("The start minute should be specified as a number between 0 and 59");
                    return;
                }
            }
            
            if (node.command === "create_flat_profile") {
                fixedValue = RED.util.evaluateNodeProperty(node.fixedValue, node.fixedValueType, node, msg, null);
                
                if (fixedValue == undefined || !Number.isInteger(fixedValue)) {
                    node.error("The constant timeslot value should be specified");
                    return;
                }
            }
            
            if (["schedule_index_profile", "schedule_time_profile", "down_sample_profile", "up_sample_profile"].includes(node.command)) {
                profile = RED.util.evaluateNodeProperty(node.profile, node.profileType, node, msg, null);

                if (profile == undefined || !Array.isArray(profile)) {
                    node.error("The profile should be specified an array of numbers");
                    return;
                }                
            }

            if (node.command === "down_sample_profile") {
                aggregation = RED.util.evaluateNodeProperty(node.aggregation, node.aggregationType, node, msg, null);

                if (aggregation == undefined || !["average", "minimum", "maximum"].includes(aggregation)) {
                    node.error("The aggregation should be 'average', 'minimum' or 'maximum'");
                    return;
                }
            }

            switch (node.command) {
                case "schedule_index_profile":
                    if (profile.length > timeslotCount) {
                        node.error("The profile has more timeslots (" + profile.length + ") as available in the horizon (" + timeslotCount +  ").");
                        return;
                    }
                    
                    if (startIndex + profile.length > timeslotCount) {
                        node.error("The schedule start index is too large, because the profile will not fit completely in the horizon.");
                        return;
                    }
    
                    // Create an array with an element per timeslot
                    outputProfile = new Array(timeslotCount);
                    outputProfile.fill(0);
    
                    // Copy the profile to the horizon at the specified start index
                    for (var i = 0; i < profile.length; i++) {
                        outputProfile[startIndex + i] = profile[i];
                    }
                    break;
                case "schedule_time_profile":
                    // Calculate to which timeslot start index the time corresponds
                    startIndex = getTimeSlotIndex(startHour, startMinute, timeslotLength);    

                    if (profile.length > timeslotCount) {
                        node.error("The profile requires more timeslots (" + profile.length + ") as available in the horizon (" + timeslotCount +  ").");
                        return;
                    }
                    
                    if (startIndex + profile.length > timeslotCount) {
                        node.error("The schedule time (hour:minute) is too high, because the profile will not fit completely in the horizon.");
                        return;
                    }
    
                    // Create an array with an element per timeslot
                    outputProfile = new Array(timeslotCount);
                    outputProfile.fill(0);
    
                    // Copy the profile to the horizon at the specified start index
                    for (var i = 0; i < profile.length; i++) {
                        outputProfile[startIndex + i] = profile[i];
                    }
                    break;
                case "down_sample_profile":
                    // If the timeslots in the message are N times longer (compared to the timeslots in the horizon), then N
                    // timeslot values needs to be aggregated.  For example 4 times shorter:
                    //
                    //        Msg:     |  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  |  9  |  10 |  11 |  12 | ...
                    //    Horizon:     |           A           |           B           |           C           | ...
                    //
                    // This means that the values of timeslots 1, 2, 3 and 4 needs to be combined (min, max, avg), and the
                    // aggregated value will be stored as value of timeslot A in the horizon.
                    
                    // Create a new shorter input array, to store all the aggregated values
                    var newProfileLength = Math.round(profile.length / timeslotCount);
                    var outputProfile = new Array(newProfileLength);
                    
                    for (var i = 0; i < profile.length; i = i + timeslotCount) {
                        // Apply the selected aggregated algorithm on N timeslot values
                        // (https://medium.com/@vladbezden/how-to-get-min-or-max-of-an-array-in-javascript-1c264ec6e1aa)
                        var valuesToAggregate = profile.slice(i, i + timeslotCount);
                        switch (aggregation) {
                            case "average":
                                var sum = 0;
                                for( var j = 0; j < valuesToAggregate.length; j++ ){
                                    sum += valuesToAggregate[j];
                                }
                                outputProfile[i / timeslotCount] = sum / valuesToAggregate.length;
                                break;
                            case "minimum":
                                outputProfile[i / timeslotCount] = Math.min.apply(Math, valuesToAggregate);
                                break;
                            case "maximum":
                                outputProfile[i / timeslotCount] = Math.max.apply(Math, valuesToAggregate);
                                break;
                        }
                    }
                    break;
                case "up_sample_profile":
                    // If the timeslots in the message are N times shorter (compared to the timeslots in the horizon), then every
                    // timeslot value needs to be duplicated N times.  For example 4 times longer:
                    //
                    //        Msg:     |           1           |           2           |           3           | ...
                    //    Horizon:     |  A  |  B  |  C  |  D  |  E  |  F  |  G  |  H  |  I  |  J  |  K  |  L  | ...
                    //
                    // This means that every msg timeslot needs to be duplicated N times:
                    //
                    //    Horizon:     |  1  |  1  |  1  |  1  |  2  |  2  |  2  |  2  |  3  |  3  |  3  |  3  | ...

                    // Create a new longer input array, to store all the duplicated values
                    var newProfileLength = profile.length * timeslotCount;
                    var outputProfile = new Array(newProfileLength);
                    
                    // Duplicate every input timeslice value N times
                    for (var i = 0; i < profile.length; i++) {
                        for (var j = 0; j < timeslotCount; j++) {
                            outputProfile[(i * timeslotCount) + j] = profile[i];
                        }
                    }
                    break;
                case "create_index_profile":
                    if (switchPoints == undefined || !Array.isArray(switchPoints)) {
                        node.error("The switchPoints should contain an array of switchpoint indexes");
                        return;
                    }

                    if (switchPoints.length > timeslotCount) {
                        node.error("There can't be more switchpoints than timeslots");
                        return null;
                    }
                    
                    for (var i = 0; i < switchPoints.length; i++) {
                        var switchPoint = switchPoints[i];
                        
                        if (switchPoint.value == undefined) {
                            node.error("All the switch points should have a value");
                            return null;
                        } 
                            
                        if (switchPoint.index == undefined) {
                            node.error("All the switch points should have an index");
                            return null;
                        }            
                    }
         
                    // Sort the switchPoints by ascending indices
                    switchPoints.sort(function(a, b) {
                        return a.index - b.index;
                    });
                    
                    if (switchPoints[0].index != 0) {
                        node.error("The first switchpoint index should be 0");
                        return null;
                    }
                    
                    // Create an array with an element per timeslot
                    outputProfile = new Array(timeslotCount);

                    // Fill the timeslots based on the switchpoints
                    for (var j = 0; j < switchPoints.length; j++) {
                        if (j === switchPoints.length - 1) {
                            // Fill the array with the switchpoint value, from the last switchpoint up to the end of the array
                            outputProfile.fill(switchPoints[j].value, switchPoints[j].index, timeslotCount);
                        }
                        else {
                            // Fill the array with the switchpoint value, up to the next switchpoint (exclusive that next switchpoint)
                            outputProfile.fill(switchPoints[j].value, switchPoints[j].index, switchPoints[j + 1].index);
                        }
                    }
                    break;
                case "create_time_profile":
                    if (switchPoints == undefined || !Array.isArray(switchPoints)) {
                        node.error("The switchPoints should contain an array of switchpoint times (format 'hh:mm')");
                        return;
                    }

                    if (switchPoints.length > timeslotCount) {
                        node.error("There can't be more switchpoints than timeslots");
                        return null;
                    }
                    
                    for (var i = 0; i < switchPoints.length; i++) {
                        var switchPoint = switchPoints[i];
                        
                        if (switchPoint.value == undefined) {
                            node.error("All the switch points should have a value");
                            return null;
                        } 

                        if (switchPoint.startHour == undefined || !Number.isInteger(switchPoint.startHour) || switchPoint.startHour < 0 || switchPoint.startHour > 23){
                            node.error("All the switch points should have a start hour, as a number between 0 and 23");
                            return;
                        }
                        
                        if (switchPoint.startMinute == undefined || !Number.isInteger(switchPoint.startMinute) || switchPoint.startMinute < 0 || switchPoint.startMinute > 59){
                            node.error("All the switch points should have a start minute, as a number between 0 and 59");
                            return;
                        }

                        // Calculate to which timeslot index the time (hour:minute) corresponds
                        switchPoint.index = getTimeSlotIndex(switchPoint.startHour, switchPoint.startMinute, timeslotLength);       
                    }
         
                    // Sort the switchPoints by ascending indices
                    switchPoints.sort(function(a, b) {
                        return a.index - b.index;
                    });
                    
                    if (switchPoints[0].index != 0) {
                        node.error("The first switchpoint index should be 0");
                        return null;
                    }
                    
                    // Create an array with an element per timeslot
                    outputProfile = new Array(timeslotCount);

                    // Fill the timeslots based on the switchpoints
                    for (var j = 0; j < switchPoints.length; j++) {
                        if (j === switchPoints.length - 1) {
                            // Fill the array with the switchpoint value, from the last switchpoint up to the end of the array
                            outputProfile.fill(switchPoints[j].value, switchPoints[j].index, timeslotCount);
                        }
                        else {
                            // Fill the array with the switchpoint value, up to the next switchpoint (exclusive that next switchpoint)
                            outputProfile.fill(switchPoints[j].value, switchPoints[j].index, switchPoints[j + 1].index);
                        }
                    }
                    break;
                case "create_flat_profile":
                    // Create an array with an element per timeslot
                    outputProfile = new Array(timeslotCount);

                    outputProfile.fill(fixedValue);
                    break;
                default:
                    node.error("Unsupported profile type requested");
                    return;
            }

            try {
                RED.util.setMessageProperty(msg, node.outputField, outputProfile);
            } 
            catch(err) {
                node.error("The output msg." + node.outputField + " field can not be set");
                return;
            }
            
            node.send(msg);
        });

        node.on("close", function() {
            node.status({});
        });
    }

    RED.nodes.registerType("time-profile", TimeProfileNode);
}