/* ============================================================================
 * foods.js — a broad list of common grocery items for NL / BE / FR / DE shoppers,
 *            including Asian / oriental store staples (e.g. Amazing Oriental, toko)
 *
 * These populate the "Item" field's suggestions so you can pick from a list
 * instead of typing every time. Entries are short, pickable names (English
 * staples plus well-known local products), and cover food plus the non-food
 * staples people price-compare at the supermarket. Your own past items always
 * rank first; these fill in the rest.
 * ==========================================================================*/

export const FOOD_CATEGORIES = {
  Fruit: [
    'Apples', 'Bananas', 'Oranges', 'Mandarins', 'Clementines', 'Tangerines', 'Pears',
    'Grapes', 'Green grapes', 'Red grapes', 'Strawberries', 'Blueberries', 'Raspberries',
    'Blackberries', 'Redcurrants', 'Gooseberries', 'Cranberries', 'Cherries', 'Kiwi',
    'Pineapple', 'Mango', 'Papaya', 'Passion fruit', 'Peaches', 'Nectarines', 'Apricots',
    'Plums', 'Figs', 'Dates', 'Pomegranate', 'Lemons', 'Limes', 'Grapefruit', 'Watermelon',
    'Melon', 'Cantaloupe', 'Avocado', 'Coconut', 'Rhubarb', 'Lychee', 'Persimmon',
  ],
  Vegetables: [
    'Potatoes', 'Sweet potato', 'Onions', 'Red onions', 'Shallots', 'Spring onions', 'Garlic',
    'Leek', 'Carrots', 'Tomatoes', 'Cherry tomatoes', 'Cucumber', 'Bell pepper', 'Red pepper',
    'Chili pepper', 'Jalapeños', 'Lettuce', 'Iceberg lettuce', 'Romaine lettuce', 'Rocket',
    'Spinach', 'Kale', 'Endive', 'Witlof', 'Broccoli', 'Cauliflower', 'Cabbage', 'Red cabbage',
    'White cabbage', 'Pointed cabbage', 'Sauerkraut', 'Brussels sprouts', 'Pak choi',
    'Chinese cabbage', 'Courgette', 'Aubergine', 'Mushrooms', 'Chestnut mushrooms', 'Portobello',
    'Green beans', 'Runner beans', 'Peas', 'Sugar snap peas', 'Mangetout', 'Edamame',
    'Bean sprouts', 'Sweetcorn', 'Celery', 'Celeriac', 'Fennel', 'Beetroot', 'Radish', 'Turnip',
    'Parsnip', 'Swede', 'Kohlrabi', 'Asparagus', 'Green asparagus', 'Pumpkin', 'Butternut squash',
    'Artichoke', 'Ginger', 'Horseradish',
  ],
  'Fresh herbs': [
    'Basil', 'Parsley', 'Coriander', 'Mint', 'Dill', 'Chives', 'Thyme', 'Rosemary', 'Sage',
    'Tarragon', 'Oregano', 'Bay leaves',
  ],
  'Dairy & eggs': [
    'Milk', 'Whole milk', 'Semi-skimmed milk', 'Skimmed milk', 'Lactose-free milk', 'Buttermilk',
    'Chocolate milk', 'Fresh cream', 'Whipping cream', 'Single cream', 'Double cream', 'Sour cream',
    'Crème fraîche', 'Butter', 'Unsalted butter', 'Salted butter', 'Margarine', 'Baking margarine',
    'Yogurt', 'Greek yogurt', 'Skyr', 'Kefir', 'Quark', 'Vla', 'Custard', 'Cottage cheese',
    'Eggs', 'Free-range eggs', 'Egg whites', 'Condensed milk', 'Evaporated milk',
  ],
  Cheese: [
    'Gouda', 'Young Gouda', 'Jong belegen', 'Belegen', 'Oude kaas', 'Edam', 'Maasdammer',
    'Old Amsterdam', 'Leerdammer', 'Brie', 'Camembert', 'Blue cheese', 'Gorgonzola', 'Roquefort',
    'Stilton', 'Mozzarella', 'Buffalo mozzarella', 'Burrata', 'Parmesan', 'Grana Padano',
    'Pecorino', 'Feta', 'Halloumi', 'Emmental', 'Gruyère', 'Comté', 'Cheddar', 'Manchego',
    'Goat cheese', 'Chèvre', 'Ricotta', 'Mascarpone', 'Cream cheese', 'Philadelphia', 'Boursin',
    'Grated cheese', 'Cheese slices', 'Raclette',
  ],
  'Plant-based': [
    'Oat milk', 'Almond milk', 'Soy milk', 'Coconut milk drink', 'Rice milk', 'Soy yogurt',
    'Coconut yogurt', 'Tofu', 'Smoked tofu', 'Tempeh', 'Seitan', 'Vegan cheese', 'Vegan butter',
    'Vegan mince', 'Veggie burger', 'Veggie sausages', 'Falafel', 'Hummus', 'Plant-based chicken',
    'Vegan mayo',
  ],
  Bakery: [
    'Bread', 'White bread', 'Brown bread', 'Whole wheat bread', 'Volkoren bread', 'Multigrain bread',
    'Sourdough', 'Rye bread', 'Roggebrood', 'Spelt bread', 'Tiger bread', 'Baguette', 'Ciabatta',
    'Focaccia', 'Pistolet', 'Bread rolls', 'Kaiserbroodje', 'Bagels', 'Pita bread', 'Naan',
    'Tortilla wraps', 'Flatbread', 'Croissant', 'Pain au chocolat', 'Brioche', 'Cinnamon rolls',
    'Danish pastry', 'Brötchen', 'Pretzel', 'Crackers', 'Beschuit', 'Knäckebröd', 'Breadsticks',
    'Breadcrumbs', 'Panko', 'Ontbijtkoek',
  ],
  'Breakfast & cereal': [
    'Cornflakes', 'Muesli', 'Granola', 'Cruesli', 'Oats', 'Porridge oats', 'Rolled oats',
    'Weetabix', 'Rice Krispies', 'Special K', 'Brinta', 'Oatmeal', 'Pancake mix', 'Jam',
    'Strawberry jam', 'Marmalade', 'Honey', 'Peanut butter', 'Chocolate spread', 'Hagelslag',
    'Vruchtenhagel', 'Speculoospasta', 'Appelstroop', 'Maple syrup',
  ],
  'Meat & poultry': [
    'Chicken breast', 'Chicken fillet', 'Chicken thighs', 'Chicken drumsticks', 'Chicken wings',
    'Whole chicken', 'Kipfilet', 'Turkey breast', 'Turkey mince', 'Duck breast', 'Minced beef',
    'Minced pork', 'Half-om-half gehakt', 'Gehakt', 'Beef steak', 'Ribeye', 'Sirloin steak',
    'Entrecôte', 'Beef roast', 'Stewing beef', 'Pork chops', 'Pork tenderloin', 'Pork belly',
    'Pork shoulder', 'Spare ribs', 'Bacon', 'Lardons', 'Pancetta', 'Sausages', 'Bratwurst',
    'Chipolatas', 'Merguez', 'Saucijzen', 'Rookworst', 'Frikandel', 'Kroket', 'Meatballs',
    'Gehaktballen', 'Hamburger patties', 'Schnitzel', 'Cordon bleu', 'Shoarma', 'Gyros',
    'Lamb chops', 'Lamb mince', 'Veal',
  ],
  'Fish & seafood': [
    'Salmon', 'Smoked salmon', 'Tuna', 'Canned tuna', 'Cod', 'Pollock', 'Haddock', 'Plaice',
    'Sole', 'Sea bass', 'Sea bream', 'Trout', 'Mackerel', 'Smoked mackerel', 'Herring', 'Haring',
    'Sardines', 'Anchovies', 'Pangasius', 'Tilapia', 'Shrimp', 'Prawns', 'King prawns', 'Mussels',
    'Crab', 'Lobster', 'Squid', 'Calamari', 'Scallops', 'Surimi', 'Fish fingers', 'Kibbeling',
    'Fish cakes',
  ],
  'Deli & charcuterie': [
    'Cooked ham', 'Achterham', 'Serrano ham', 'Prosciutto', 'Parma ham', 'Salami', 'Pepperoni',
    'Chorizo', 'Mortadella', 'Bresaola', 'Coppa', 'Cervelat', 'Pastrami', 'Roast beef slices',
    'Turkey slices', 'Chicken slices', 'Corned beef', 'Filet américain', 'Leverworst',
    'Boterhamworst', 'Grillworst', 'Bierworst', 'Ossenworst', 'Paté', 'Rillettes', 'Saucisson',
  ],
  'Pasta, rice & grains': [
    'Spaghetti', 'Penne', 'Fusilli', 'Farfalle', 'Macaroni', 'Tagliatelle', 'Linguine',
    'Lasagne sheets', 'Cannelloni', 'Vermicelli', 'Egg noodles', 'Rice noodles', 'Instant noodles',
    'Gnocchi', 'Tortellini', 'Ravioli', 'White rice', 'Brown rice', 'Basmati rice', 'Jasmine rice',
    'Risotto rice', 'Paella rice', 'Pudding rice', 'Couscous', 'Bulgur', 'Quinoa', 'Polenta',
    'Semolina', 'Barley', 'Buckwheat',
  ],
  'Canned & jarred': [
    'Canned tomatoes', 'Chopped tomatoes', 'Passata', 'Tomato paste', 'Tomato purée', 'Canned corn',
    'Canned peas', 'Baked beans', 'Kidney beans', 'Black beans', 'White beans', 'Chickpeas',
    'Butter beans', 'Lentils', 'Green lentils', 'Red lentils', 'Olives', 'Green olives',
    'Black olives', 'Gherkins', 'Pickles', 'Capers', 'Jarred peppers', 'Sun-dried tomatoes',
    'Coconut milk', 'Applesauce', 'Fruit cocktail',
  ],
  'Baking & pantry': [
    'Flour', 'Plain flour', 'Self-raising flour', 'Bread flour', 'Whole wheat flour', 'Sugar',
    'Caster sugar', 'Brown sugar', 'Icing sugar', 'Vanilla sugar', 'Baking powder', 'Baking soda',
    'Yeast', 'Dried yeast', 'Cornstarch', 'Custard powder', 'Gelatin', 'Cocoa powder',
    'Chocolate chips', 'Vanilla extract', 'Marzipan', 'Sprinkles', 'Cake mix', 'Pie crust',
    'Puff pastry', 'Shortcrust pastry', 'Filo pastry',
  ],
  'Oils, vinegars & condiments': [
    'Olive oil', 'Extra virgin olive oil', 'Sunflower oil', 'Vegetable oil', 'Rapeseed oil',
    'Coconut oil', 'Sesame oil', 'Frying oil', 'Balsamic vinegar', 'White vinegar', 'Wine vinegar',
    'Apple cider vinegar', 'Ketchup', 'Curry ketchup', 'Mayonnaise', 'Mustard', 'Dijon mustard',
    'Fritessaus', 'Joppiesaus', 'Piccalilli', 'Chutney', 'Salad dressing', 'Vinaigrette',
  ],
  Sauces: [
    'Pasta sauce', 'Bolognese sauce', 'Tomato sauce', 'Carbonara sauce', 'Pesto', 'Green pesto',
    'Red pesto', 'Soy sauce', 'Ketjap', 'Sweet chili sauce', 'Hot sauce', 'Sriracha', 'Tabasco',
    'Sambal', 'Harissa', 'Oyster sauce', 'Hoisin sauce', 'Teriyaki sauce', 'Fish sauce',
    'Worcestershire sauce', 'Satay sauce', 'Pindasaus', 'BBQ sauce', 'Salsa', 'Guacamole',
    'Tzatziki', 'Aioli', 'Gravy', 'Curry sauce', 'Stock', 'Vegetable stock', 'Chicken stock',
    'Bouillon',
  ],
  'Spices & seasonings': [
    'Salt', 'Sea salt', 'Black pepper', 'White pepper', 'Peppercorns', 'Paprika', 'Smoked paprika',
    'Cumin', 'Coriander seeds', 'Turmeric', 'Curry powder', 'Garam masala', 'Ras el hanout',
    'Cinnamon', 'Nutmeg', 'Cloves', 'Cardamom', 'Ginger powder', 'Chili powder', 'Cayenne pepper',
    'Chili flakes', 'Garlic powder', 'Onion powder', 'Italian herbs', 'Herbes de Provence',
    'Vanilla', 'Saffron', 'Stock cubes', 'Mixed herbs',
  ],
  'Nuts, seeds & dried fruit': [
    'Almonds', 'Walnuts', 'Cashews', 'Hazelnuts', 'Pistachios', 'Pecans', 'Peanuts', 'Pine nuts',
    'Brazil nuts', 'Macadamia nuts', 'Mixed nuts', 'Sunflower seeds', 'Pumpkin seeds',
    'Sesame seeds', 'Chia seeds', 'Flax seeds', 'Raisins', 'Sultanas', 'Dried apricots',
    'Dried cranberries', 'Prunes', 'Coconut flakes',
  ],
  'Snacks & sweets': [
    'Crisps', 'Tortilla chips', 'Nachos', 'Doritos', 'Pringles', 'Popcorn', 'Salted peanuts',
    'Trail mix', 'Rice cakes', 'Grissini', 'Tuc', 'Cookies', 'Chocolate chip cookies', 'Digestives',
    'Oreos', 'Biscuits', 'Speculoos', 'Stroopwafel', 'Pepernoten', 'Kruidnoten', 'Wine gums',
    'Licorice', 'Drop', 'Haribo', 'Marshmallows', 'Chewing gum', 'Mentos', 'Tic Tac', 'Pretzels',
  ],
  'Chocolate & confectionery': [
    'Chocolate', 'Milk chocolate', 'Dark chocolate', 'White chocolate', 'Chocolate bar', 'Milka',
    'Toblerone', 'KitKat', 'Twix', 'Snickers', 'Mars', 'Bounty', 'M&Ms', 'Maltesers', 'Pralines',
    'Bonbons', 'Truffles', 'Fudge', 'Toffees', 'Nutella', 'Hazelnut spread',
  ],
  Beverages: [
    'Water', 'Still water', 'Sparkling water', 'Mineral water', 'Spa water', 'Cola', 'Cola Zero',
    'Fanta', 'Sprite', '7up', 'Cassis', 'Tonic water', 'Ginger ale', 'Ice tea', 'Orange juice',
    'Apple juice', 'Multivitamin juice', 'Cranberry juice', 'Tomato juice', 'Smoothie', 'Milkshake',
    'Chocomel', 'Fristi', 'Energy drink', 'Red Bull', 'Sports drink', 'Lemonade', 'Ranja', 'Squash',
    'Kombucha',
  ],
  'Hot drinks': [
    'Coffee', 'Ground coffee', 'Coffee beans', 'Instant coffee', 'Coffee pads', 'Senseo pads',
    'Nespresso pods', 'Coffee capsules', 'Decaf coffee', 'Tea', 'Black tea', 'Green tea',
    'Herbal tea', 'Peppermint tea', 'Rooibos', 'Chamomile tea', 'Earl Grey', 'Hot chocolate',
    'Cocoa', 'Chai',
  ],
  Alcohol: [
    'Beer', 'Pilsner', 'Radler', 'Non-alcoholic beer', 'Craft beer', 'Cider', 'Red wine',
    'White wine', 'Rosé wine', 'Sparkling wine', 'Prosecco', 'Cava', 'Champagne', 'Whisky', 'Vodka',
    'Gin', 'Rum', 'Tequila', 'Aperol', 'Vermouth', 'Liqueur', 'Baileys',
  ],
  Frozen: [
    'Frozen pizza', 'Frozen lasagne', 'Frozen fries', 'Frites', 'Frozen vegetables', 'Frozen peas',
    'Frozen spinach', 'Frozen broccoli', 'Frozen berries', 'Frozen fruit', 'Frozen fish',
    'Fish sticks', 'Frozen shrimp', 'Chicken nuggets', 'Frozen chicken', 'Bitterballen',
    'Frikandellen', 'Kroketten', 'Spring rolls', 'Ice cream', 'Vanilla ice cream', 'Magnum',
    'Ice lollies', 'Sorbet', 'Gelato', 'Frozen yogurt', 'Frozen croissants', 'Pizza baguette',
    'Frozen waffles',
  ],
  'World foods': [
    'Taco shells', 'Tortillas', 'Nacho cheese', 'Refried beans', 'Fajita kit', 'Curry paste',
    'Red curry paste', 'Green curry paste', 'Rice paper', 'Spring roll wrappers', 'Nori',
    'Sushi rice', 'Wasabi', 'Miso paste', 'Kimchi', 'Poppadoms', 'Tahini', 'Ramen', 'Udon noodles',
    'Gyoza', 'Dumplings',
  ],
  'Asian sauces & pastes': [
    'Light soy sauce', 'Dark soy sauce', 'Kecap manis', 'Ketjap', 'Fish sauce', 'Oyster sauce',
    'Hoisin sauce', 'Teriyaki sauce', 'Ponzu', 'Mirin', 'Rice vinegar', 'Rice wine',
    'Shaoxing wine', 'Sesame oil', 'Chili oil', 'Sriracha', 'Sambal oelek', 'Sambal badjak',
    'Gochujang', 'Gochugaru', 'Doubanjiang', 'Black bean sauce', 'Sweet chili sauce', 'Plum sauce',
    'Char siu sauce', 'Satay sauce', 'Peanut sauce', 'Yellow curry paste', 'Massaman curry paste',
    'Panang curry paste', 'Tom yum paste', 'Laksa paste', 'Tamarind paste', 'White miso',
    'Red miso', 'Dashi', 'Furikake', 'Pickled ginger', 'Shrimp paste', 'Trassi',
    'Nasi goreng paste', 'Bami goreng paste',
  ],
  'Asian noodles & wrappers': [
    'Rice noodles', 'Rice vermicelli', 'Egg noodles', 'Ramen noodles', 'Soba noodles',
    'Glass noodles', 'Mung bean noodles', 'Instant noodles', 'Indomie', 'Mi goreng',
    'Wonton wrappers', 'Gyoza wrappers', 'Dumpling wrappers',
  ],
  'Asian rice & flours': [
    'Jasmine rice', 'Glutinous rice', 'Sticky rice', 'Black rice', 'Rice flour',
    'Glutinous rice flour', 'Tapioca starch', 'Potato starch', 'Chapati flour',
  ],
  'Asian fresh & tofu': [
    'Firm tofu', 'Silken tofu', 'Fried tofu', 'Tau pok', 'Fish balls', 'Fish cake', 'Crab sticks',
    'Bok choy', 'Choy sum', 'Kai lan', 'Napa cabbage', 'Morning glory', 'Kangkong', 'Daikon',
    'Lotus root', 'Bamboo shoots', 'Water chestnuts', 'Enoki mushrooms', 'Shiitake mushrooms',
    'Oyster mushrooms', 'King oyster mushrooms', 'Wood ear mushrooms', 'Bitter melon',
    'Winter melon', 'Taro', 'Galangal', 'Lemongrass', 'Kaffir lime leaves', 'Thai basil',
    "Bird's eye chili", 'Curry leaves', 'Pandan leaves', 'Paneer', 'Ghee',
  ],
  'Asian canned & dry': [
    'Coconut cream', 'Coconut water', 'Straw mushrooms', 'Baby corn', 'Lychee', 'Longan',
    'Rambutan', 'Jackfruit', 'Palm sugar', 'Rock sugar', 'Red bean paste', 'Lotus paste',
    'Dried shiitake', 'Dried shrimp', 'Dried anchovies', 'Kombu', 'Wakame', 'Seaweed', 'Curry roux',
    'Atjar', 'Serundeng',
  ],
  'Asian snacks & drinks': [
    'Prawn crackers', 'Kroepoek', 'Seaweed snacks', 'Pocky', 'Mochi', 'Rice crackers', 'Senbei',
    'Wasabi peas', 'Dried mango', 'Bubble tea', 'Tapioca pearls', 'Boba', 'Matcha', 'Green tea',
    'Jasmine tea', 'Oolong tea', 'Soy milk', 'Aloe vera drink', 'Ramune', 'Calpico', 'Yakult',
    'Milk tea', 'Mango pudding',
  ],
  'Asian spices': [
    'Five spice', 'Star anise', 'Sichuan pepper', 'Szechuan pepper', 'Fenugreek', 'Mustard seeds',
    'Garam masala', 'Tandoori masala', 'Curry powder', 'Turmeric', 'Cardamom',
  ],
  'Baby & toddler': [
    'Baby formula', 'Baby milk', 'Baby food', 'Fruit pouch', 'Baby porridge', 'Baby rusks',
    'Toddler snacks', 'Nappies', 'Diapers', 'Baby wipes', 'Baby shampoo', 'Nappy cream',
  ],
  Household: [
    'Toilet paper', 'Kitchen roll', 'Paper towels', 'Tissues', 'Napkins', 'Dish soap',
    'Washing-up liquid', 'Dishwasher tablets', 'Dishwasher salt', 'Rinse aid', 'Laundry detergent',
    'Washing powder', 'Fabric softener', 'Stain remover', 'Bin bags', 'Cling film',
    'Aluminium foil', 'Baking paper', 'Freezer bags', 'Sandwich bags', 'Sponges', 'Scouring pads',
    'All-purpose cleaner', 'Bleach', 'Toilet cleaner', 'Glass cleaner', 'Air freshener',
    'Batteries', 'Light bulbs', 'Tealights',
  ],
  'Personal care': [
    'Toothpaste', 'Toothbrush', 'Mouthwash', 'Dental floss', 'Shampoo', 'Conditioner', 'Shower gel',
    'Bar soap', 'Hand soap', 'Body lotion', 'Deodorant', 'Antiperspirant', 'Razors', 'Shaving foam',
    'Shaving gel', 'Sunscreen', 'Cotton pads', 'Cotton buds', 'Wet wipes', 'Hand sanitizer',
    'Tampons', 'Sanitary pads', 'Panty liners', 'Plasters', 'Paracetamol', 'Ibuprofen', 'Vitamins',
    'Vitamin C', 'Multivitamins', 'Lip balm',
  ],
  Pet: [
    'Dog food', 'Wet dog food', 'Dry dog food', 'Dog treats', 'Cat food', 'Wet cat food',
    'Dry cat food', 'Cat treats', 'Cat litter', 'Bird seed', 'Fish food', 'Rabbit food',
  ],
};

/** Flat, de-duplicated, alphabetically sorted list for the datalist. */
export const COMMON_FOODS = (() => {
  const seen = new Set();
  const out = [];
  for (const items of Object.values(FOOD_CATEGORIES)) {
    for (const name of items) {
      const key = name.toLowerCase();
      if (!seen.has(key)) { seen.add(key); out.push(name); }
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
})();
