/*
 Copyright (c) 2022

 Author(s):
   Rodrigo González <rgonzalez@sun.industries>

 Copyright (c) 2011, 2013

 Author(s):
   Martin Raspaud <martin.raspaud@smhi.se>

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * Note, this is a port of https://github.com/pytroll/pyorbital/pyorbital/astronomy.py
 * from Python to C++
*/

#include "transforms.hpp"
#include "datediff.cpp"
#include <cmath>

namespace solar2 {

const double rad2deg = 180.0 / pi;
const double deg2rad = pi / 180.0;
const double sec_in_a_day = 86400.0;

struct RaDec
{
    double ra;
    double dec;
};

/**
 * @brief Get the days since year 2000
 * 
 * @param utc_time 
 * @return double 
 */
double jdays2000(Time time) {
    datediff::Date dt1 = { time.day, time.mon, time.year };
    datediff::Date dt2 = { 1, 1, 2000 };
    double diff = datediff::getDifference(dt1, dt2);
    diff += ((time.hr * 60. * 60.) + (time.mi * 60.) + time.sec) / sec_in_a_day;
    return diff;
}

/**
 * @brief Ecliptic longitude of the sun at *utc_time*.
 * 
 * @param time 
 * @return double 
 */
double sun_ecliptic_longitude(double jdate) {
    // mean anomaly, rad
    double m_a = deg2rad * (357.52910 +
                     35999.05030 * jdate -
                     0.0001559 * jdate * jdate -
                     0.00000048 * jdate * jdate * jdate);
    // mean longitude, deg
    double l_0 = 280.46645 + 36000.76983 * jdate + 0.0003032 * jdate * jdate;
    double d_l = ((1.914600 - 0.004817 * jdate - 0.000014 * jdate * jdate) * sin(m_a) +
           (0.019993 - 0.000101 * jdate) * sin(2 * m_a) + 0.000290 * sin(3 * m_a));
    // true longitude, deg
    double l__ = l_0 + d_l;
    return deg2rad * l__;
}


/**
 * @brief Right ascension and declination of the sun at *time* (utc).
 * 
 * @return RaDec 
 */
RaDec sun_ra_dec(Time time) {
    double jdate = jdays2000(time) / 36525.0;
    double eps = deg2rad * (23.0 + 26.0 / 60.0 + 21.448 / 3600.0 -
                     (46.8150 * jdate + 0.00059 * jdate * jdate -
                      0.001813 * jdate * jdate * jdate) / 3600);
    double eclon = sun_ecliptic_longitude(jdate);
    double x__ = cos(eclon);
    double y__ = cos(eps) * sin(eclon);
    double z__ = sin(eps) * sin(eclon);
    double r__ = sqrt(1.0 - z__ * z__);
    // sun declination
    double declination = atan2(z__, r__);
    // right ascension
    double right_ascension = 2.0 * atan2(y__, (x__ + r__));
    return {right_ascension, declination};
}

/**
 * @brief Greenwich mean sidereal utc_time, in radians.
    As defined in the AIAA 2006 implementation:
    http://www.celestrak.com/publications/AIAA/2006-6753/
 * 
 * @return double 
 */
double gmst(Time time) {
    double ut1 = jdays2000(time) / 36525.0;
    double theta = 67310.54841 + ut1 * (876600 * 3600 + 8640184.812866 + ut1 *
                                 (0.093104 - ut1 * 6.2 * 10e-6));
    return fmod(deg2rad * (theta / 240.0), 2 * pi);
}

/**
 * @brief Local mean sidereal time, computed from *utc_time* and *longitude*.
    In radians.
 * 
 * @return double 
 */
double _lmst(Time time, double longitude) {
    return gmst(time) + longitude;
}

/**
 * @brief Hour angle at *utc_time* for the given *longitude* and
    *right_ascension*
    longitude in radians
 * 
 * @return double 
 */
double _local_hour_angle(Time time, double longitude, double right_ascension) {
    return _lmst(time, longitude) - right_ascension;
}

/**
 * @brief Cosine of the sun-zenith angle for *lon*, *lat* at *utc_time*.
    utc_time: datetime.datetime instance of the UTC time
    lon and lat in degrees.
 * 
 * @param utc_time 
 * @param lon 
 * @param lat 
 * @return double 
 */
double cos_zen(Time time, double lon, double lat) {
    lon = deg2rad * lon;
    lat = deg2rad * lat;

    RaDec sunRaDec = sun_ra_dec(time);
    double h__ = _local_hour_angle(time, lon, sunRaDec.ra);
    return (sin(lat) * sin(sunRaDec.dec) + cos(lat) * cos(sunRaDec.dec) * cos(h__));
}

/**
 * @brief Sun-zenith angle for *lon*, *lat* at *utc_time*.
    lon,lat in degrees.
    The angle returned is given in degrees
 * 
 * @param utc_time 
 * @param lon 
 * @param lat 
 * @return double 
 */
double sun_zenith_angle(Time time, double lon, double lat) {
    return rad2deg * (acos(cos_zen(time, lon, lat)));
}

}