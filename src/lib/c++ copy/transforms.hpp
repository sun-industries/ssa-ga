#ifndef transforms_HPP_
#define transforms_HPP_

// Params for twoline2rv
const char typerun = 'v';   // verification, means to obtain inputs from the TLE
const char typeinput = 'e'; // doesn't matters, because typerun is 'v'
const char opsmode = 'i';   // improved
const int whichconst = 1;   // wgs84
const double MINUTES_PER_DAY = 1440.0;

#define pi 3.14159265358979323846

const double rad2deg = 180.0 / pi;
const double deg2rad = pi / 180.0;
const double earthRadius = 6378.137; // km

struct V3 {
    double x;
    double y;
    double z;
};

// Coordinate frame Earth Centered Inertial (ECI)
// https://en.wikipedia.org/wiki/Earth-centered_inertial
struct EciV3 : V3 {};

// Coordinate frame Earth Centered Fixed (ECF)
// https://en.wikipedia.org/wiki/ECEF
struct EcfV3 {
    double x;
    double y;
    double z;
};

// The PosVel result is a key-value pair of ECI coordinates.
// These are the base results from which all other coordinates are derived.
struct PosVel {
    EciV3 pos;
    V3 vel;
};

// https://en.wikipedia.org/wiki/Geographic_coordinate_system#Latitude_and_longitude
struct Geodetic {
    double longitude;
    double latitude;
    double height;
};

struct Topocentric {
    double topS; // Positive horizontal vector S due south.
    double topE; // Positive horizontal vector E due east.
    double topZ; // Vector Z normal to the surface of the earth (up).
};

struct LookAngles {
    double azimuth; // radians https://en.wikipedia.org/wiki/Azimuth
    double elevation; // radians
    double rangeSat; // kilometer
};

struct Tle {
    std::string line1;
    std::string line2;
};

struct Time
{
    int year;
    int mon;
    int day;
    int hr;
    int mi;
    int sec;
};


struct Transit {
    std::vector<Time> time;
    std::vector<double> azimuth; 
    std::vector<double> elevation; 
    std::vector<double> rangeSat;
    std::vector<double> sunlit;
    std::vector<double> eclipseDepth;
};

struct SatLogItem {
    std::vector<Transit> transits;
    int _transitIndex = 0;
    double _prevElevation = 0;
    bool _isRising = true;
};

struct Observer: Geodetic {
    bool defined = false;
    double minElevation;
};

struct SatTableRow {
    std::string id;
    int transit;
    Time starting;
    Time ending;
    double maxElevation;
    double apexAzimuth;
    Transit detailed;
    double sunlitRatio;
};

struct ObserveResult {
    EciV3 eci;
    Geodetic geodetic; // this is in grades
    LookAngles lookAngles;
};

struct TickResult : Geodetic {
    std::string satnum;
    bool overfly = false; // if is in the observer FOV
    bool visible = false; // if overfly, is night and has sun light
};

EcfV3 geodeticToEcf(Geodetic geodetic);
Topocentric topocentric(Geodetic observerGeodetic, V3 satelliteEcf);
Geodetic eciToGeodetic(EciV3 eci, double gmst);
EcfV3 eciToEcf(EciV3 eci, double gmst);
Topocentric topocentric(Geodetic observerGeodetic, EcfV3 satelliteEcf);
LookAngles topocentricToLookAngles(Topocentric tc);
LookAngles ecfToLookAngles(Geodetic observerGeodetic, EcfV3 satelliteEcf);
double radiansToDegrees(double radians);

#endif