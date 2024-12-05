import 'dart:developer';

class CVDetails {
  final String level;
  final String role;
  final String skillset;

  CVDetails({
    required this.level,
    required this.role,
    required this.skillset,
  });

  factory CVDetails.fromString(String details) {

    // Remove any surrounding quotes
    details = details.replaceAll(RegExp(r'^"|"$'), '');

    log('details>>>>>>: $details');
    // Split the string by the escaped newline character
    List<String> processedDetails = details.split('\\n');

    // Ensure we have at least 3 details
    if (processedDetails.length < 3) {
      throw ArgumentError('Insufficient CV details. Received: ${processedDetails.length} details');
    }

    return CVDetails(
      level: _extractValue(processedDetails[0], 'Level:'),
      role: _extractValue(processedDetails[1], 'Developer Role:'),
      skillset: _extractValue(processedDetails[2], 'Skillset:'),
    );
  }
  static String _extractValue(String detail, String label) {
    return detail.substring(detail.indexOf(label) + label.length).trim();
  }

  @override
  String toString() {
    return 'CVDetails(level: $level, role: $role, skillset: $skillset)';
  }
}