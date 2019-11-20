/**
 * @apiDefine AuthorizationHeader
 *
 * @apiHeader {String} Authorization JWT access token obtained at /login
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "authorization": "yJvc21JZCI6MTcxNTMsIm9zbU..."
 *     }
 *
 */

/**
 * @apiDefine PaginationParams
 *
 * @apiParam (Pagination) {integer} limit Number of items per page.
 * @apiParam (Pagination) {integer} page Page to return.
 * @apiParam (Pagination) {object} sort Sorting parameters.
 * @apiParamExample {json} Pagination example:
 * {
 *  page: 3,
 *  limit: 20,
 *  sort: {
 *    length: 'desc',
 *    uploadedAt: 'asc'
 *  }
 * }
 *
 */

/**
 * @apiDefine Error4xx
 *
 * @apiError statusCode     Error HTTP status code
 * @apiError error          Error name
 * @apiError message        Error message
 * @apiErrorExample {json} Error Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *      "statusCode": 400,
 *      "error": "Bad Request",
 *      "message": "Oops!"
 *     }
 */

/**
 * @apiDefine Success200
 *
 * @apiSuccess statusCode     HTTP status code
 * @apiSuccess message        Success message
 * @apiSuccessExample {json} Success response:
 *     HTTP/1.1 200 Success
 *     {
 *      "statusCode": 200,
 *      "message": "Action completed successfully."
 *     }
 */

/**
 * @apiDefine Success200TraceJSON
 *
 * @apiSuccess {object} tracejson Trace in TraceJSON format.
 * @apiSuccessExample {json} Success response:
 *     HTTP/1.1 200 Success
 *     {
 *       "type": "Feature",
 *       "properties": {
 *         "description": "This is a TraceJSON file.",
 *         "timestamps": [
 *           1564011260021,
 *           1564011261801,
 *           1564011262345,
 *           1564011263968,
 *           1564011264112,
 *           1564011265883
 *         ]
 *       },
 *       "geometry": {
 *         "type": "LineString",
 *         "coordinates": [
 *           [-46.6599869728088, -23.5927391909129],
 *           [-46.6597080230712, -23.5919329603572],
 *           [-46.6589999198913, -23.5909300812880],
 *           [-46.6580557823181, -23.590320484382],
 *           [-46.6571545600891, -23.5900648461272],
 *           [-46.6564464569091, -23.58951423896]
 *         ]
 *       }
 *     }
 */

/**
 * @apiDefine Success200GPX
 *
 * @apiSuccess {String} file Trace in GPX format.
 * @apiSuccessExample {String} Success response:
 *     HTTP/1.1 200 Success
 *     <gpx xmlns="http://www.topografix.com/GPX/1/1"
 *     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="togpx">
 *     <metadata/>
 *     <trk>
 *       <name>_EQOlQXjjY</name>
 *       <desc>id=_EQOlQXjjY ownerId=709 ownerDisplayName=vitor description=This is a TraceJSON file. length=534.717</desc>
 *       <trkseg>
 *         <trkpt lat="-23.5927391909129" lon="-46.6599869728088">
 *           <time>2019-07-24T23:34:20.021Z</time>
 *         </trkpt>
 *         <trkpt lat="-23.5919329603572" lon="-46.6597080230712">
 *           <time>2019-07-24T23:34:21.801Z</time>
 *         </trkpt>
 *         <trkpt lat="-23.590930081288" lon="-46.6589999198913">
 *           <time>2019-07-24T23:34:22.345Z</time>
 *         </trkpt>
 *         <trkpt lat="-23.590320484382" lon="-46.6580557823181">
 *           <time>2019-07-24T23:34:23.968Z</time>
 *         </trkpt>
 *         <trkpt lat="-23.5900648461272" lon="-46.6571545600891">
 *           <time>2019-07-24T23:34:24.112Z</time>
 *         </trkpt>
 *         <trkpt lat="-23.58951423896" lon="-46.6564464569091">
 *           <time>2019-07-24T23:34:25.883Z</time>
 *         </trkpt>
 *       </trkseg>
 *     </trk>
 *     </gpx>
 */
