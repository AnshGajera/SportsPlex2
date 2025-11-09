import 'dart:io';

class AppConfig {
  // Use the correct IP address for mobile device connection
  static const String baseUrl = 'http://192.168.1.35:5000';

  // Alternative: Environment-based configuration  
  static const String _developmentUrl = 'http://192.168.43.154:5000';
  static const String _productionUrl = 'https://your-production-domain.com';

  static String get apiUrl {
    const bool isProduction = bool.fromEnvironment('dart.vm.product');
    return isProduction ? _productionUrl : _developmentUrl;
  }

  // Dynamic IP discovery for physical devices
  static Future<String> getLocalNetworkUrl() async {
    try {
      // Get all network interfaces
      final interfaces = await NetworkInterface.list();

      for (var interface in interfaces) {
        for (var addr in interface.addresses) {
          // Look for IPv4 addresses that are not loopback
          if (addr.type == InternetAddressType.IPv4 &&
              !addr.isLoopback &&
              addr.address.startsWith('192.168.')) {
            return 'http://${addr.address}:5000';
          }
        }
      }
    } catch (e) {
      print('Error getting network interface: $e');
    }

    // Fallback to default
    return baseUrl;
  }
}
