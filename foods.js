/* ============================================================================
 * foods.js — a starter list of common groceries for NL / BE / FR / DE shoppers
 *
 * These populate the "Item" field's suggestions so you can pick from a list
 * instead of typing every time. Entries are deliberately short, pickable names
 * (English staples plus well-known local products). Your own past items always
 * rank first; these fill in the rest.
 * ==========================================================================*/

export const FOOD_CATEGORIES = {
  Fruit: [
    'Apples', 'Bananas', 'Oranges', 'Mandarins', 'Pears', 'Grapes', 'Strawberries',
    'Blueberries', 'Raspberries', 'Kiwi', 'Pineapple', 'Mango', 'Peaches', 'Plums',
    'Cherries', 'Lemons', 'Limes', 'Watermelon', 'Melon', 'Avocado',
  ],
  Vegetables: [
    'Potatoes', 'Onions', 'Garlic', 'Carrots', 'Tomatoes', 'Cherry tomatoes', 'Cucumber',
    'Bell pepper', 'Lettuce', 'Spinach', 'Broccoli', 'Cauliflower', 'Courgette', 'Aubergine',
    'Leek', 'Celery', 'Mushrooms', 'Green beans', 'Peas', 'Sweetcorn', 'Cabbage',
    'Red cabbage', 'Sauerkraut', 'Brussels sprouts', 'Witlof', 'Kale', 'Beetroot', 'Radish',
    'Asparagus', 'Pumpkin', 'Sweet potato', 'Fennel', 'Ginger',
  ],
  'Dairy & eggs': [
    'Milk', 'Semi-skimmed milk', 'Whole milk', 'Buttermilk', 'Yogurt', 'Greek yogurt',
    'Vla', 'Cream', 'Whipping cream', 'Crème fraîche', 'Butter', 'Margarine', 'Eggs',
    'Quark', 'Cottage cheese',
  ],
  Cheese: [
    'Gouda', 'Jong belegen', 'Oude kaas', 'Edam', 'Brie', 'Camembert', 'Mozzarella',
    'Parmesan', 'Feta', 'Emmental', 'Gruyère', 'Maasdammer', 'Cream cheese', 'Goat cheese',
  ],
  Bakery: [
    'Bread', 'White bread', 'Volkoren bread', 'Baguette', 'Ciabatta', 'Croissant',
    'Pain au chocolat', 'Brötchen', 'Bread rolls', 'Bagels', 'Pita bread', 'Wraps',
    'Roggebrood', 'Crackers', 'Beschuit', 'Knäckebröd',
  ],
  'Meat & poultry': [
    'Chicken breast', 'Chicken thighs', 'Whole chicken', 'Gehakt', 'Minced beef',
    'Minced pork', 'Half-om-half gehakt', 'Beef steak', 'Pork chops', 'Bacon', 'Sausages',
    'Bratwurst', 'Rookworst', 'Frikandel', 'Kroket', 'Ham', 'Turkey', 'Schnitzel',
  ],
  'Fish & seafood': [
    'Salmon', 'Tuna', 'Cod', 'Pollock', 'Haring', 'Mackerel', 'Shrimp', 'Mussels',
    'Fish fingers', 'Smoked salmon', 'Kibbeling',
  ],
  'Deli & charcuterie': [
    'Cooked ham', 'Salami', 'Chorizo', 'Chicken fillet', 'Pâté', 'Leverworst',
    'Prosciutto', 'Filet américain',
  ],
  Pantry: [
    'Rice', 'Pasta', 'Spaghetti', 'Penne', 'Macaroni', 'Noodles', 'Flour', 'Sugar',
    'Brown sugar', 'Icing sugar', 'Salt', 'Pepper', 'Olive oil', 'Sunflower oil', 'Vinegar',
    'Baking powder', 'Yeast', 'Oats', 'Muesli', 'Granola', 'Cornflakes', 'Lentils',
    'Chickpeas', 'Kidney beans', 'Canned tomatoes', 'Tomato paste', 'Coconut milk',
    'Bouillon', 'Honey', 'Peanut butter', 'Jam',
  ],
  'Sauces & condiments': [
    'Ketchup', 'Mayonnaise', 'Mustard', 'Curry ketchup', 'Soy sauce', 'Pesto',
    'Pasta sauce', 'Salad dressing', 'Sriracha', 'Appelmoes',
  ],
  'Sweet & spreads': [
    'Hagelslag', 'Chocolate spread', 'Speculoos spread', 'Marmalade', 'Nutella',
  ],
  'Snacks & sweets': [
    'Crisps', 'Nuts', 'Peanuts', 'Chocolate', 'Chocolate bar', 'Biscuits', 'Stroopwafel',
    'Speculoos', 'Pretzels', 'Popcorn', 'Sweets', 'Drop', 'Waffles', 'Gummy bears',
  ],
  Beverages: [
    'Water', 'Sparkling water', 'Orange juice', 'Apple juice', 'Coffee', 'Coffee beans',
    'Coffee pads', 'Tea', 'Cola', 'Soft drink', 'Beer', 'Red wine', 'White wine',
    'Energy drink', 'Ice tea', 'Ranja',
  ],
  Frozen: [
    'Frozen pizza', 'Frozen vegetables', 'Frites', 'Ice cream', 'Frozen berries',
    'Frozen fish',
  ],
  'Herbs & spices': [
    'Basil', 'Parsley', 'Coriander', 'Oregano', 'Thyme', 'Rosemary', 'Paprika powder',
    'Cumin', 'Curry powder', 'Cinnamon', 'Nutmeg', 'Bay leaves', 'Chili flakes', 'Turmeric',
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
