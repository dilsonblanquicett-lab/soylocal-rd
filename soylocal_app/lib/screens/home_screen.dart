import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'booking_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> _experiences = [];
  bool _isLoading = true;
  String? _userName;
  final TextEditingController _cityController = TextEditingController();
  String _selectedCategory = '';

  final Map<String, String> categoryIcons = {
    'clase': '💃',
    'tour': '🚌',
    'gastronomia': '🍽️',
    'arte': '🎨',
    'bienestar': '🧘',
  };

  final Map<String, Color> categoryColors = {
    'clase': const Color(0xFF0066CC),
    'tour': const Color(0xFF0055AA),
    'gastronomia': const Color(0xFF0088FF),
    'arte': const Color(0xFF003366),
    'bienestar': const Color(0xFF00A86B),
  };

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    await _loadProfile();
    await _loadExperiences();
  }

  Future<void> _loadProfile() async {
    try {
      final user = await ApiService.getProfile();
      setState(() {
        _userName = user['full_name'];
      });
    } catch (e) {
      print('Error loading profile: $e');
    }
  }

  Future<void> _loadExperiences() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final experiences = await ApiService.getExperiences(
        city: _cityController.text.isNotEmpty ? _cityController.text : null,
        category: _selectedCategory.isNotEmpty ? _selectedCategory : null,
      );
      setState(() {
        _experiences = experiences;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  Future<void> _logout() async {
    await ApiService.logout();
    if (mounted) {
      Navigator.pushReplacementNamed(context, '/');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('SoyLocal RD'),
        actions: [
          if (_userName != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Center(
                child: Text(
                  'Hola, $_userName',
                  style: const TextStyle(fontSize: 14),
                ),
              ),
            ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
          ),
        ],
      ),
      body: Column(
        children: [
          // Filtros
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _cityController,
                        decoration: InputDecoration(
                          hintText: 'Buscar por ciudad...',
                          prefixIcon: const Icon(Icons.location_city, color: Color(0xFF0066CC)),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onSubmitted: (_) => _loadExperiences(),
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: _loadExperiences,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0066CC),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Icon(Icons.search),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      FilterChip(
                        label: const Text('Todos'),
                        selected: _selectedCategory.isEmpty,
                        onSelected: (_) {
                          setState(() {
                            _selectedCategory = '';
                          });
                          _loadExperiences();
                        },
                        backgroundColor: Colors.grey[200],
                        selectedColor: const Color(0xFF0066CC),
                        labelStyle: TextStyle(
                          color: _selectedCategory.isEmpty ? Colors.white : Colors.black,
                        ),
                      ),
                      const SizedBox(width: 8),
                      FilterChip(
                        label: const Text('💃 Clases'),
                        selected: _selectedCategory == 'clase',
                        onSelected: (_) {
                          setState(() {
                            _selectedCategory = _selectedCategory == 'clase' ? '' : 'clase';
                          });
                          _loadExperiences();
                        },
                        backgroundColor: Colors.grey[200],
                        selectedColor: const Color(0xFF0066CC),
                      ),
                      const SizedBox(width: 8),
                      FilterChip(
                        label: const Text('🚌 Tours'),
                        selected: _selectedCategory == 'tour',
                        onSelected: (_) {
                          setState(() {
                            _selectedCategory = _selectedCategory == 'tour' ? '' : 'tour';
                          });
                          _loadExperiences();
                        },
                        backgroundColor: Colors.grey[200],
                        selectedColor: const Color(0xFF0066CC),
                      ),
                      const SizedBox(width: 8),
                      FilterChip(
                        label: const Text('🍽️ Gastronomía'),
                        selected: _selectedCategory == 'gastronomia',
                        onSelected: (_) {
                          setState(() {
                            _selectedCategory = _selectedCategory == 'gastronomia' ? '' : 'gastronomia';
                          });
                          _loadExperiences();
                        },
                        backgroundColor: Colors.grey[200],
                        selectedColor: const Color(0xFF0066CC),
                      ),
                      const SizedBox(width: 8),
                      FilterChip(
                        label: const Text('🎨 Arte'),
                        selected: _selectedCategory == 'arte',
                        onSelected: (_) {
                          setState(() {
                            _selectedCategory = _selectedCategory == 'arte' ? '' : 'arte';
                          });
                          _loadExperiences();
                        },
                        backgroundColor: Colors.grey[200],
                        selectedColor: const Color(0xFF0066CC),
                      ),
                      const SizedBox(width: 8),
                      FilterChip(
                        label: const Text('🧘 Bienestar'),
                        selected: _selectedCategory == 'bienestar',
                        onSelected: (_) {
                          setState(() {
                            _selectedCategory = _selectedCategory == 'bienestar' ? '' : 'bienestar';
                          });
                          _loadExperiences();
                        },
                        backgroundColor: Colors.grey[200],
                        selectedColor: const Color(0xFF0066CC),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Lista de experiencias
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _experiences.isEmpty
                    ? const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.search_off, size: 64, color: Colors.grey),
                            SizedBox(height: 16),
                            Text('No hay experiencias disponibles'),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _experiences.length,
                        itemBuilder: (context, index) {
                          final exp = _experiences[index];
                          final category = exp['category'];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: InkWell(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => BookingScreen(
                                      experienceId: exp['id'],
                                      title: exp['title'],
                                      price: double.parse(exp['price'].toString()),
                                      city: exp['city'],
                                      duration: exp['duration_minutes'],
                                      maxPeople: exp['max_people'],
                                      description: exp['description'],
                                    ),
                                  ),
                                );
                              },
                              borderRadius: BorderRadius.circular(16),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 80,
                                      height: 80,
                                      decoration: BoxDecoration(
                                        color: categoryColors[category] ?? const Color(0xFF0066CC),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Center(
                                        child: Text(
                                          categoryIcons[category] ?? '🏖️',
                                          style: const TextStyle(fontSize: 40),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 16),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            exp['title'],
                                            style: const TextStyle(
                                              fontSize: 18,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Row(
                                            children: [
                                              Icon(Icons.location_on,
                                                  size: 14, color: Colors.grey[600]),
                                              const SizedBox(width: 4),
                                              Text(
                                                exp['city'],
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.grey[600],
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 8),
                                          Row(
                                            children: [
                                              const Icon(Icons.access_time,
                                                  size: 14, color: Color(0xFF0066CC)),
                                              const SizedBox(width: 4),
                                              Text('${exp['duration_minutes']} min'),
                                              const SizedBox(width: 16),
                                              const Icon(Icons.people,
                                                  size: 14, color: Color(0xFF0066CC)),
                                              const SizedBox(width: 4),
                                              Text('Max. ${exp['max_people']}'),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        Text(
                                          '\$${exp['price']}',
                                          style: const TextStyle(
                                            fontSize: 24,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF00A86B),
                                          ),
                                        ),
                                        const Text(
                                          '/persona',
                                          style: TextStyle(fontSize: 12, color: Colors.grey),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}