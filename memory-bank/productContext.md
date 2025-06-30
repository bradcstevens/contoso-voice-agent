# Product Context - Contoso Outdoor Company

## Business Domain

Contoso Outdoor Company specializes in high-quality outdoor gear and equipment for adventure enthusiasts, hikers, campers, and outdoor sports participants.

## Product Catalog Overview

### Catalog Size: 20 Premium Outdoor Products

The product catalog includes:
- **Tents & Shelters**: Multi-season camping solutions
- **Backpacks & Bags**: Hiking and travel gear
- **Clothing & Apparel**: Weather-resistant outdoor clothing
- **Accessories**: Essential outdoor equipment and tools

### Product Data Structure

Each product includes:
- **ID**: Unique product identifier
- **Name**: Product title
- **Description**: Detailed product information
- **Price**: Pricing information
- **Category**: Product classification
- **Brand**: Manufacturer/brand name
- **Features**: Key product attributes
- **Images**: Visual product assets (located in `/web/public/images/`)
- **Manuals**: Detailed specifications (located in `/web/public/manuals/`)

### Data Sources

- **Product Catalog**: `api/chat/products.json` and `web/public/products.json`
- **Product Images**: `web/public/images/[product_id]/` directories
- **Product Manuals**: `web/public/manuals/product_info_[id].md`
- **Category Data**: `web/public/categories.json`
- **Brand Data**: `web/public/brands.json`

## Customer Interaction Patterns

### Purchase History Integration

- **User Data**: `api/chat/purchases.json` and `api/suggestions/purchases.json`
- **Recommendation Logic**: AI-powered suggestions based on previous purchases
- **Personalization**: Preferences derived from purchase patterns

### Conversation Context

- **Product Discovery**: Natural language queries about outdoor gear
- **Comparison Requests**: Side-by-side product comparisons
- **Recommendation Scenarios**: Situational product suggestions
- **Technical Specifications**: Detailed product information requests

## AI Integration Points

### Chat Interface Product Integration

- **Prompty Template**: `api/chat/chat.prompty`
- **Product Injection**: Real-time product data integration into conversations
- **Context Awareness**: Understanding customer needs and preferences

### Suggestion Engine

- **Prompty Templates**: 
  - `api/suggestions/suggestions.prompty`
  - `api/suggestions/writeup.prompty`
- **Recommendation Logic**: AI-driven product matching
- **Cross-selling**: Complementary product suggestions

### Voice Interaction Product Context

- **Script Template**: `api/voice/script.jinja2`
- **Voice-optimized Descriptions**: Audio-friendly product information
- **Conversational Product Discovery**: Voice-based browsing experience

## Customer Personas

### Primary Target Customers

1. **Adventure Hikers**: Multi-day backpacking equipment
2. **Weekend Campers**: Family-friendly camping gear
3. **Outdoor Athletes**: Performance-oriented equipment
4. **Gear Enthusiasts**: High-end technical equipment

### Common Use Cases

- **Trip Planning**: Equipment recommendations for specific outdoor activities
- **Gear Upgrades**: Replacing or upgrading existing equipment
- **Gift Shopping**: Outdoor gear gifts for enthusiasts
- **Seasonal Preparation**: Weather-specific equipment needs

## Product Management Workflows

### Inventory Integration

- **Real-time Availability**: Product availability status
- **Seasonal Adjustments**: Seasonal product prominence
- **New Product Integration**: Process for adding new products

### Quality Assurance

- **Product Data Validation**: Ensuring accurate product information
- **Image Quality**: High-resolution product photography
- **Description Accuracy**: Detailed and accurate product descriptions

## Success Metrics

### Product Recommendation Effectiveness

- **Conversion Rates**: Recommendations leading to purchases
- **Customer Satisfaction**: Positive feedback on suggested products
- **Cross-sell Success**: Additional product purchases per session

### Customer Engagement

- **Product Discovery**: Time spent exploring products
- **Information Requests**: Frequency of detailed product questions
- **Comparison Behavior**: Product comparison patterns

---

*Product Context established for AI-powered retail assistant*
*Integrated with comprehensive product catalog and customer data*
