class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final String unit;
  final String imageUrl;
  final String category;
  final int healthScore;
  final int stockQuantity;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.unit,
    required this.imageUrl,
    required this.category,
    required this.healthScore,
    required this.stockQuantity,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      unit: json['unit']?.toString() ?? 'unit',
      imageUrl: json['image_url']?.toString() ?? '',
      category: json['category']?.toString() ?? 'General',
      healthScore: json['health_score'] as int? ?? 85,
      stockQuantity: json['stock_quantity'] as int? ?? 50,
    );
  }
}
