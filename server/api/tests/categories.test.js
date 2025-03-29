const { getCategories, getCategoryID, getCategoryDetails } = require('../database-queries/categories');
const pool = require('../pool');

jest.mock('../pool');

describe('Categories Queries', () => {
  describe('getCategories', () => {
    it('should return categories for a given transaction type', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ name: 'Food' }, { name: 'Rent' }] });

      const result = await getCategories('expense');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT name FROM CATEGORY WHERE category_type = $1;',
        ['expense']
      );
      expect(result).toEqual([{ name: 'Food' }, { name: 'Rent' }]);
    });

    it('should return an empty array if no categories are found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getCategories('income');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT name FROM CATEGORY WHERE category_type = $1;',
        ['income']
      );
      expect(result).toEqual([]);
    });
  });

  describe('getCategoryID', () => {
    it('should return the category ID for a given name and type', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ category_id: 1 }] });

      const result = await getCategoryID('Food', 'expense');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT category_id FROM CATEGORY WHERE name = $1 AND category_type = $2;',
        ['Food', 'expense']
      );
      expect(result).toEqual({ category_id: 1 });
    });

    it('should return undefined if the category is not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getCategoryID('Nonexistent', 'expense');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT category_id FROM CATEGORY WHERE name = $1 AND category_type = $2;',
        ['Nonexistent', 'expense']
      );
      expect(result).toBeUndefined();
    });
  });

  describe('getCategoryDetails', () => {
    it('should return the category details for a given category ID', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ name: 'Food', category_type: 'expense' }] });

      const result = await getCategoryDetails(1);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT name, category_type WHERE category_id = $1',
        [1]
      );
      expect(result).toEqual({ name: 'Food', category_type: 'expense' });
    });

    it('should return undefined if the category ID is not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getCategoryDetails(999);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT name, category_type WHERE category_id = $1',
        [999]
      );
      expect(result).toBeUndefined();
    });
  });
});
