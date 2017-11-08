const Util = (() => ({

  /**
   * @param {object|string} obj
   * @return {number}
   */
  hashify: (obj) => {
    const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < obj.length; i++) {
      const character = obj.charCodeAt(i);
      hash = ((hash<<5)-hash)+character;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  },

}))();
