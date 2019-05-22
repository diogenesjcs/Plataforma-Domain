from mapper.index import Index
from mapper.loader import Loader
from mapper.transform import Transform
from mapper.translator import Translator
import datetime

class MapBuilder:
    loaded = False
    built = {}
    loaded_at = datetime.datetime.now()
    cache_enable = True
    def build(self):
        if not MapBuilder.cache_enable or not MapBuilder.loaded:
            maps = Loader().build()
            index = Index()
            index.parse(maps)
            transform = Transform(index)
            translator = Translator(index)
            MapBuilder.built = Mapper(index,transform,translator)
            MapBuilder.loaded = True
            MapBuilder.loaded_at = datetime.datetime.now()
        return MapBuilder.built

    def build_from_map(self, map_):
        index = Index()
        index.parse([map_])
        transform = Transform(index)
        translator = Translator(index)
        return Mapper(index,transform,translator)

class Mapper:
    def __init__(self, index, transform, translator):
        self.index = index
        self.transform = transform
        self.translator = translator

