export class UpdateMap<K, V> extends Map<K, V> {
  public get(key: K): V | undefined {
    return super.get(key);
  }

  public set(key: K, value: V): this {
    // TODO: update to value that gives more information (ie number > unknown)
    if (!super.has(key)) {
      super.set(key, value);
    } else {
      console.warn('Not updating type.');
    }
    return this;
  }

  // public filter(func: (key: K, value: V) => boolean): UpdateMap<K, V> {
  //   const newValues = Array.from(super.entries()).filter(([key, value]) =>
  //     func(key, value)
  //   );
  //   return new UpdateMap(newValues);
  // }
}
