import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3000/api';

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  static Future<Map<String, String>> getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await saveToken(data['token']);
      return data;
    } else {
      throw Exception('Error al iniciar sesión');
    }
  }

  static Future<Map<String, dynamic>> register(
    String email,
    String fullName,
    String phone,
    String password,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register-tourist'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'full_name': fullName,
        'phone': phone,
        'password': password,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = jsonDecode(response.body);
      await saveToken(data['token']);
      return data;
    } else {
      throw Exception('Error al registrar');
    }
  }

  static Future<List<dynamic>> getExperiences({String? city, String? category}) async {
    String url = '$baseUrl/experiences';
    if (city != null && city.isNotEmpty) url += '?city=$city';
    if (category != null && category.isNotEmpty) {
      url += city == null ? '?category=$category' : '&category=$category';
    }

    final response = await http.get(Uri.parse(url));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['experiences'];
    } else {
      throw Exception('Error al cargar experiencias');
    }
  }

  static Future<Map<String, dynamic>> createBooking(
    String experienceId,
    String bookingDate,
    String bookingTime,
    int numberOfPeople,
    String specialRequests,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/bookings'),
      headers: await getHeaders(),
      body: jsonEncode({
        'experience_id': experienceId,
        'booking_date': bookingDate,
        'booking_time': bookingTime,
        'number_of_people': numberOfPeople,
        'special_requests': specialRequests,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Error al crear reserva');
    }
  }

  static Future<List<dynamic>> getMyBookings() async {
    final response = await http.get(
      Uri.parse('$baseUrl/bookings/my-bookings'),
      headers: await getHeaders(),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['bookings'];
    } else {
      throw Exception('Error al cargar reservas');
    }
  }

  static Future<Map<String, dynamic>> getProfile() async {
    final response = await http.get(
      Uri.parse('$baseUrl/auth/me'),
      headers: await getHeaders(),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['user'];
    } else {
      throw Exception('Error al cargar perfil');
    }
  }
}