import { FieldBehavior } from '@buf/googleapis_googleapis.bufbuild_es/google/api/field_behavior_pb';
import { create } from '@bufbuild/protobuf';
import { TestFieldBehaviorSchema } from './../gen/bearclaw/aip/v1/fieldbehavior_pb';
import { clearFieldsWithBehaviors } from './fieldbehavior';

describe('fieldbehavior', () => {
  it('should return a clone if no field with the behavior is present', () => {
    const message = create(TestFieldBehaviorSchema, {
      normal: 'normal',
      required: 'required',
    });
    const cleared = clearFieldsWithBehaviors(TestFieldBehaviorSchema, message, [
      FieldBehavior.OUTPUT_ONLY,
    ]);
    expect(cleared).toEqual(message);
    expect(cleared === message).toBe(false);
  });

  it('should clear fields with a behavior', () => {
    const message = create(TestFieldBehaviorSchema, {
      normal: 'normal',
      required: 'required',
      outputOnly: 'outputOnly',
      outputOnlyChild: {
        normal: 'normal',
      },
      repeatedOutputOnly: ['outputOnly1', 'outputOnly2'],
    });
    const cleared = clearFieldsWithBehaviors(TestFieldBehaviorSchema, message, [
      FieldBehavior.OUTPUT_ONLY,
    ]);
    expect(cleared).toEqual(
      create(TestFieldBehaviorSchema, {
        normal: 'normal',
        required: 'required',
      })
    );
    expect(cleared === message).toBe(false);
  });

  it('should clear field with set field_behavior on nested message', () => {
    const message = create(TestFieldBehaviorSchema, {
      normal: 'normal',
      required: 'required',
      outputOnly: 'outputOnly',
      normalChild: {
        normal: 'normal',
        required: 'required',
        outputOnly: 'outputOnly',
      },
    });
    const cleared = clearFieldsWithBehaviors(TestFieldBehaviorSchema, message, [
      FieldBehavior.OUTPUT_ONLY,
    ]);
    expect(cleared).toEqual(
      create(TestFieldBehaviorSchema, {
        normal: 'normal',
        required: 'required',
        normalChild: {
          normal: 'normal',
          required: 'required',
        },
      })
    );
    expect(cleared === message).toBe(false);
  });

  it('should clear field with set field_behavior on multiple levels of nested messages', () => {
    const message = create(TestFieldBehaviorSchema, {
      normal: 'normal',
      required: 'required',
      outputOnly: 'outputOnly',
      normalChild: {
        normal: 'normal',
        required: 'required',
        outputOnly: 'outputOnly',
        normalChild: {
          normal: 'normal',
          required: 'required',
          outputOnly: 'outputOnly',
        },
      },
    });
    const cleared = clearFieldsWithBehaviors(TestFieldBehaviorSchema, message, [
      FieldBehavior.OUTPUT_ONLY,
    ]);
    expect(cleared).toEqual(
      create(TestFieldBehaviorSchema, {
        normal: 'normal',
        required: 'required',
        normalChild: {
          normal: 'normal',
          required: 'required',
          normalChild: {
            normal: 'normal',
            required: 'required',
          },
        },
      })
    );
    expect(cleared === message).toBe(false);
  });

  it('should clear fields with set field_behavior on repeated message', () => {
    const message = create(TestFieldBehaviorSchema, {
      normal: 'normal',
      required: 'required',
      outputOnly: 'outputOnly',
      repeatedNormalChild: [
        {
          normal: 'normal',
          required: 'required',
          outputOnly: 'outputOnly',
        },
      ],
    });
    const cleared = clearFieldsWithBehaviors(TestFieldBehaviorSchema, message, [
      FieldBehavior.OUTPUT_ONLY,
    ]);
    expect(cleared).toEqual(
      create(TestFieldBehaviorSchema, {
        normal: 'normal',
        required: 'required',
        repeatedNormalChild: [
          {
            normal: 'normal',
            required: 'required',
          },
        ],
      })
    );
    expect(cleared === message).toBe(false);
  });

  it('should clear fields with set field_behavior on multiple levels of repeated messages', () => {
    const message = create(TestFieldBehaviorSchema, {
      normal: 'normal',
      required: 'required',
      outputOnly: 'outputOnly',
      repeatedNormalChild: [
        {
          normal: 'normal',
          required: 'required',
          outputOnly: 'outputOnly',
          repeatedNormalChild: [
            {
              normal: 'normal',
              required: 'required',
              outputOnly: 'outputOnly',
            },
          ],
        },
      ],
    });
    const cleared = clearFieldsWithBehaviors(TestFieldBehaviorSchema, message, [
      FieldBehavior.OUTPUT_ONLY,
    ]);
    expect(cleared).toEqual(
      create(TestFieldBehaviorSchema, {
        normal: 'normal',
        required: 'required',
        repeatedNormalChild: [
          {
            normal: 'normal',
            required: 'required',
            repeatedNormalChild: [
              {
                normal: 'normal',
                required: 'required',
              },
            ],
          },
        ],
      })
    );
    expect(cleared === message).toBe(false);
  });

  it('should clear repeated field with set field_behavior', () => {
    const message = create(TestFieldBehaviorSchema, {
      normal: 'normal',
      required: 'required',
      outputOnly: 'outputOnly',
      repeatedOutputOnly: ['outputOnly1', 'outputOnly2'],
    });
    const cleared = clearFieldsWithBehaviors(TestFieldBehaviorSchema, message, [
      FieldBehavior.OUTPUT_ONLY,
    ]);
    expect(cleared).toEqual(
      create(TestFieldBehaviorSchema, {
        normal: 'normal',
        required: 'required',
      })
    );
    expect(cleared === message).toBe(false);
  });

  it('should clear fields with set field_behavior on message in map', () => {
    const message = create(TestFieldBehaviorSchema, {
      normal: 'normal',
      required: 'required',
      outputOnly: 'outputOnly',
      mapNormalChild: {
        key: {
          normal: 'normal',
          required: 'required',
          outputOnly: 'outputOnly',
        },
      },
    });
    const cleared = clearFieldsWithBehaviors(TestFieldBehaviorSchema, message, [
      FieldBehavior.OUTPUT_ONLY,
    ]);
    expect(cleared).toEqual(
      create(TestFieldBehaviorSchema, {
        normal: 'normal',
        required: 'required',
        mapNormalChild: {
          key: {
            normal: 'normal',
            required: 'required',
          },
        },
      })
    );
    expect(cleared === message).toBe(false);
  });

  it('should clear fields with set field_behavior on multiple levels of messages in map', () => {
    const message = create(TestFieldBehaviorSchema, {
      normal: 'normal',
      required: 'required',
      outputOnly: 'outputOnly',
      mapNormalChild: {
        key: {
          normal: 'normal',
          required: 'required',
          outputOnly: 'outputOnly',
          mapNormalChild: {
            key: {
              normal: 'normal',
              required: 'required',
              outputOnly: 'outputOnly',
            },
          },
        },
      },
    });
    const cleared = clearFieldsWithBehaviors(TestFieldBehaviorSchema, message, [
      FieldBehavior.OUTPUT_ONLY,
    ]);
    expect(cleared).toEqual(
      create(TestFieldBehaviorSchema, {
        normal: 'normal',
        required: 'required',
        mapNormalChild: {
          key: {
            normal: 'normal',
            required: 'required',
            mapNormalChild: {
              key: {
                normal: 'normal',
                required: 'required',
              },
            },
          },
        },
      })
    );
    expect(cleared === message).toBe(false);
  });

  it('should clear fields with set field_behavior on repeated message in map', () => {
    const message = create(TestFieldBehaviorSchema, {
      normal: 'normal',
      required: 'required',
      outputOnly: 'outputOnly',
      mapNormalChild: {
        key: {
          normal: 'normal',
          required: 'required',
          outputOnly: 'outputOnly',
          repeatedNormalChild: [
            {
              normal: 'normal',
              required: 'required',
              outputOnly: 'outputOnly',
            },
          ],
        },
      },
    });
    const cleared = clearFieldsWithBehaviors(TestFieldBehaviorSchema, message, [
      FieldBehavior.OUTPUT_ONLY,
    ]);
    expect(cleared).toEqual(
      create(TestFieldBehaviorSchema, {
        normal: 'normal',
        required: 'required',
        mapNormalChild: {
          key: {
            normal: 'normal',
            required: 'required',
            repeatedNormalChild: [
              {
                normal: 'normal',
                required: 'required',
              },
            ],
          },
        },
      })
    );
    expect(cleared === message).toBe(false);
  });

  it('should clear map field with set field_behavior', () => {
    const message = create(TestFieldBehaviorSchema, {
      normal: 'normal',
      required: 'required',
      outputOnly: 'outputOnly',
      mapOutputOnly: {
        key1: 'outputOnly1',
        key2: 'outputOnly2',
      },
    });
    const cleared = clearFieldsWithBehaviors(TestFieldBehaviorSchema, message, [
      FieldBehavior.OUTPUT_ONLY,
    ]);
    expect(cleared).toEqual(
      create(TestFieldBehaviorSchema, {
        normal: 'normal',
        required: 'required',
      })
    );
    expect(cleared === message).toBe(false);
  });

  it('should clear field with set field_behavior on oneof message', () => {
    const message = create(TestFieldBehaviorSchema, {
      normal: 'normal',
      required: 'required',
      outputOnly: 'outputOnly',
      oneof: {
        case: 'normalOneofChild',
        value: {
          normal: 'normal',
          required: 'required',
          outputOnly: 'outputOnly',
        },
      },
    });
    const cleared = clearFieldsWithBehaviors(TestFieldBehaviorSchema, message, [
      FieldBehavior.OUTPUT_ONLY,
    ]);
    expect(cleared).toEqual(
      create(TestFieldBehaviorSchema, {
        normal: 'normal',
        required: 'required',
        oneof: {
          case: 'normalOneofChild',
          value: {
            normal: 'normal',
            required: 'required',
          },
        },
      })
    );
    expect(cleared === message).toBe(false);
  });

  it('should mutate the original object if shouldMutate is true', () => {
    const message = create(TestFieldBehaviorSchema, {
      normal: 'normal',
      required: 'required',
      outputOnly: 'outputOnly',
    });
    const cleared = clearFieldsWithBehaviors(
      TestFieldBehaviorSchema,
      message,
      [FieldBehavior.OUTPUT_ONLY],
      true
    );
    expect(cleared).toEqual(
      create(TestFieldBehaviorSchema, {
        normal: 'normal',
        required: 'required',
      })
    );
    expect(cleared === message).toBe(true);
  });

  it('should clear multiple field behaviors', () => {
    const message = create(TestFieldBehaviorSchema, {
      normal: 'normal',
      required: 'required',
      outputOnly: 'outputOnly',
      immutable: 'immutable',
    });
    const cleared = clearFieldsWithBehaviors(TestFieldBehaviorSchema, message, [
      FieldBehavior.OUTPUT_ONLY,
      FieldBehavior.IMMUTABLE,
    ]);
    expect(cleared).toEqual(
      create(TestFieldBehaviorSchema, {
        normal: 'normal',
        required: 'required',
      })
    );
    expect(cleared === message).toBe(false);
  });
});
