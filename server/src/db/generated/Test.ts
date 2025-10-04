import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const TestPlain = t.Object(
  { id: t.String(), name: t.String(), count: t.Integer() },
  { additionalProperties: false },
);

export const TestRelations = t.Object({}, { additionalProperties: false });

export const TestPlainInputCreate = t.Object(
  { name: t.String(), count: t.Integer() },
  { additionalProperties: false },
);

export const TestPlainInputUpdate = t.Object(
  { name: t.Optional(t.String()), count: t.Optional(t.Integer()) },
  { additionalProperties: false },
);

export const TestRelationsInputCreate = t.Object(
  {},
  { additionalProperties: false },
);

export const TestRelationsInputUpdate = t.Partial(
  t.Object({}, { additionalProperties: false }),
);

export const TestWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          name: t.String(),
          count: t.Integer(),
        },
        { additionalProperties: false },
      ),
    { $id: "Test" },
  ),
);

export const TestWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object({ id: t.String() }, { additionalProperties: false }),
          { additionalProperties: false },
        ),
        t.Union([t.Object({ id: t.String() })], {
          additionalProperties: false,
        }),
        t.Partial(
          t.Object({
            AND: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            NOT: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            OR: t.Array(Self, { additionalProperties: false }),
          }),
          { additionalProperties: false },
        ),
        t.Partial(
          t.Object(
            { id: t.String(), name: t.String(), count: t.Integer() },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Test" },
);

export const TestSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      name: t.Boolean(),
      count: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const TestInclude = t.Partial(
  t.Object({ _count: t.Boolean() }, { additionalProperties: false }),
);

export const TestOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      name: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      count: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Test = t.Composite([TestPlain, TestRelations], {
  additionalProperties: false,
});

export const TestInputCreate = t.Composite(
  [TestPlainInputCreate, TestRelationsInputCreate],
  { additionalProperties: false },
);

export const TestInputUpdate = t.Composite(
  [TestPlainInputUpdate, TestRelationsInputUpdate],
  { additionalProperties: false },
);
