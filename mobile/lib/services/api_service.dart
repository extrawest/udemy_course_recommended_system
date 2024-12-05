import 'dart:convert';
import 'dart:developer';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:path/path.dart' as path;

import '../common/network/exceptions/api_exceptions.dart';

const String baseUrl = 'http://localhost:3000/api';

class ApiService {
  Future<String> courseRecommendation({
    required String query,
  }) async {
    log('course got request>>> $query');

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/course-recommendation'),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode(<String, String>{
          'query': query,
        }),
      );

      if (response.statusCode == 200) {
        final decodedResponse = jsonDecode(response.body);
        log('response.body: $decodedResponse');
        return decodedResponse;
      } else {
        throw ApiException('Failed to perform search', statusCode: response.statusCode);
      }
    } on http.ClientException catch (e) {
      throw ApiException('Network error: ${e.message}');
    } on FormatException catch (_) {
      throw ApiException('Failed to parse response');
    } catch (e) {
      throw ApiException('Unexpected error occurred: $e');
    }
  }

  Future<String> uploadFile(File file) async {
    var uri = Uri.parse('$baseUrl/upload-cv');
    var request = http.MultipartRequest('POST', uri);

    log('File path: ${file.path}');
    String fileExtension = path.extension(file.path).toLowerCase();
    String mimeType;
    switch (fileExtension) {
      case '.pdf':
        mimeType = 'application/pdf';
        break;
      case '.docx':
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.csv':
        mimeType = 'text/csv';
        break;
      default:
        mimeType = 'application/octet-stream';
    }

    request.files.add(await http.MultipartFile.fromPath(
      'file', // This should match the key your server expects
      file.path,
      contentType: MediaType.parse(mimeType),
    ));

    final response = await request.send();

    // Add these lines to print out the response body
    final respStr = await response.stream.bytesToString();

    if (response.statusCode == 200) {
      return respStr;
    } else {
      log('File upload failed with status: ${response.statusCode}');
      return 'Something went wrong';
    }
  }
}
